-- ===============================================================
-- 🔧 ZERO TRUST SHARE - DATABASE MAINTENANCE SCRIPTS
-- ===============================================================
-- Run these queries for database maintenance and monitoring
-- ===============================================================

-- ===============================================================
-- 1. CLEANUP OPERATIONS
-- ===============================================================

-- Clean up expired files
DELETE FROM public.shared_files 
WHERE expires_at IS NOT NULL AND expires_at < now();

-- Clean up expired invitations
UPDATE public.invitations 
SET status = 'expired'
WHERE status = 'pending' AND expires_at < now();

-- Clean up expired SMS verifications
DELETE FROM public.sms_verification
WHERE expires_at < now();

-- Clean up orphaned email shares (where file was deleted)
DELETE FROM public.email_shares
WHERE file_id NOT IN (SELECT id FROM public.shared_files);

-- ===============================================================
-- 2. MONITORING QUERIES
-- ===============================================================

-- Check database size and table statistics
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_stat_get_tuples_inserted(oid) as inserts,
    pg_stat_get_tuples_updated(oid) as updates,
    pg_stat_get_tuples_deleted(oid) as deletes
FROM pg_tables pt
JOIN pg_class pc ON pt.tablename = pc.relname
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'shared_files', 'email_shares', 'sms_verification', 'invitations')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Active files summary
SELECT 
    COUNT(*) as total_files,
    COUNT(CASE WHEN expires_at IS NULL THEN 1 END) as permanent_files,
    COUNT(CASE WHEN expires_at IS NOT NULL AND expires_at > now() THEN 1 END) as active_expiring_files,
    COUNT(CASE WHEN expires_at IS NOT NULL AND expires_at <= now() THEN 1 END) as expired_files,
    COUNT(CASE WHEN burn_after_read = true THEN 1 END) as burn_after_read_files,
    SUM(file_size) as total_storage_bytes,
    pg_size_pretty(SUM(file_size)) as total_storage_readable
FROM public.shared_files;

-- User activity summary
SELECT 
    COUNT(DISTINCT up.user_id) as total_users,
    COUNT(DISTINCT sf.owner_id) as users_with_files,
    AVG(files_per_user.file_count) as avg_files_per_user
FROM public.user_profiles up
LEFT JOIN public.shared_files sf ON up.user_id = sf.owner_id
LEFT JOIN (
    SELECT owner_id, COUNT(*) as file_count
    FROM public.shared_files
    GROUP BY owner_id
) files_per_user ON up.user_id = files_per_user.owner_id;

-- Recent activity (last 24 hours)
SELECT 
    'Files uploaded' as activity,
    COUNT(*) as count
FROM public.shared_files
WHERE created_at > now() - interval '24 hours'

UNION ALL

SELECT 
    'Email shares sent' as activity,
    COUNT(*) as count
FROM public.email_shares
WHERE sent_at > now() - interval '24 hours'

UNION ALL

SELECT 
    'SMS verifications created' as activity,
    COUNT(*) as count
FROM public.sms_verification
WHERE created_at > now() - interval '24 hours'

UNION ALL

SELECT 
    'Invitations sent' as activity,
    COUNT(*) as count
FROM public.invitations
WHERE created_at > now() - interval '24 hours';

-- ===============================================================
-- 3. SECURITY AUDIT QUERIES
-- ===============================================================

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'shared_files', 'email_shares', 'sms_verification', 'invitations')
ORDER BY tablename;

-- List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check for files without proper encryption metadata
SELECT 
    id,
    file_name,
    CASE 
        WHEN file_salt IS NULL OR file_salt = '' THEN 'Missing salt'
        WHEN file_iv IS NULL OR file_iv = '' THEN 'Missing IV'
        WHEN master_key_hash IS NULL OR master_key_hash = '' THEN 'Missing key hash'
        WHEN metadata_iv IS NULL OR metadata_iv = '' THEN 'Missing metadata IV'
        ELSE 'OK'
    END as encryption_status
FROM public.shared_files
WHERE file_salt IS NULL OR file_salt = ''
   OR file_iv IS NULL OR file_iv = ''
   OR master_key_hash IS NULL OR master_key_hash = ''
   OR metadata_iv IS NULL OR metadata_iv = '';

-- ===============================================================
-- 4. PERFORMANCE OPTIMIZATION
-- ===============================================================

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Analyze table statistics
ANALYZE public.user_profiles;
ANALYZE public.shared_files;
ANALYZE public.email_shares;
ANALYZE public.sms_verification;
ANALYZE public.invitations;

-- ===============================================================
-- 5. BACKUP PREPARATION
-- ===============================================================

-- Export user data (excluding sensitive info)
COPY (
    SELECT 
        up.id,
        up.full_name,
        up.email,
        up.created_at,
        COUNT(sf.id) as file_count,
        SUM(sf.file_size) as total_storage
    FROM public.user_profiles up
    LEFT JOIN public.shared_files sf ON up.user_id = sf.owner_id
    GROUP BY up.id, up.full_name, up.email, up.created_at
    ORDER BY up.created_at
) TO '/tmp/user_summary.csv' CSV HEADER;

-- Export file metadata (excluding encryption keys)
COPY (
    SELECT 
        sf.id,
        sf.file_name,
        sf.file_size,
        sf.expires_at,
        sf.burn_after_read,
        sf.download_count,
        sf.created_at,
        up.email as owner_email
    FROM public.shared_files sf
    JOIN public.user_profiles up ON sf.owner_id = up.user_id
    ORDER BY sf.created_at
) TO '/tmp/files_summary.csv' CSV HEADER;

SELECT '✅ Database maintenance queries completed!' as status;

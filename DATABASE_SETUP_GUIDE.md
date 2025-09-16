# 🚀 Zero Trust Share - Database Setup Guide

## 📋 Available Database Setup Scripts

I've created **4 comprehensive SQL scripts** for your Zero Trust Share database setup. Choose the one that fits your situation:

### 🟢 **1. `database-setup-safe.sql` - RECOMMENDED**
**Use this for:** Production, existing databases, or when you want to preserve data
- ✅ Creates tables only if they don't exist (`CREATE TABLE IF NOT EXISTS`)
- ✅ Preserves existing data
- ✅ Updates policies and functions safely
- ✅ Handles trigger dependencies correctly
- ✅ Safe for multiple runs

### 🟡 **2. `database-setup-minimal.sql` - QUICK START**
**Use this for:** New projects, testing, or minimal setup
- ✅ Creates only essential tables (user_profiles, shared_files)
- ✅ Basic RLS policies
- ✅ Lightweight and fast
- ✅ Good for prototyping

### 🔴 **3. `complete-database-setup.sql` - FULL RESET**
**Use this for:** Fresh start, development, or complete rebuild
- ⚠️ **WARNING: DROPS ALL EXISTING DATA**
- ✅ Complete feature set (email sharing, SMS, invitations)
- ✅ All indexes and optimizations
- ✅ Comprehensive RLS policies
- ✅ All utility functions

### 🔧 **4. `database-maintenance.sql` - MAINTENANCE**
**Use this for:** Database cleanup, monitoring, and maintenance
- ✅ Cleanup expired files and verifications
- ✅ Database monitoring queries
- ✅ Performance optimization
- ✅ Security audit queries

## 🎯 Quick Setup Instructions

### Step 1: Choose Your Script
```bash
# For production/existing database (RECOMMENDED)
database-setup-safe.sql

# For new/empty database with full features
complete-database-setup.sql

# For minimal setup/testing
database-setup-minimal.sql
```

### Step 2: Run in Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste your chosen script
4. Click **Run** button

### Step 3: Verify Setup
The script will show verification messages at the end. Look for:
- ✅ "Database Setup Complete!" message
- Table creation confirmations
- Function creation confirmations

### Step 4: Test Your Application
```bash
npm run dev
```

## 🗂️ Database Schema Overview

Your Zero Trust Share system includes these tables:

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **user_profiles** | Extended user info | Links to auth.users, stores full_name, phone |
| **shared_files** | Core file metadata | Encrypted file info, expiration, burn-after-read |
| **email_shares** | Email sharing tracking | Track sent/opened emails, recipient management |
| **sms_verification** | SMS passcode auth | 15-min expiry, attempt limits, phone verification |
| **invitations** | Invite unregistered users | 7-day expiry, token-based access |

## 🔐 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Anonymous Access**: Controlled access for file recipients
- **Encrypted Storage**: All file content encrypted before storage
- **Time-based Expiry**: Automatic cleanup of expired content
- **Audit Trail**: Track all sharing and access activities

## 🔧 Maintenance

Run periodic maintenance:
```sql
-- Run cleanup (removes expired content)
SELECT run_all_cleanup();

-- Check database health
\i database-maintenance.sql
```

## 🚨 Troubleshooting

### Error: "function depends on trigger"
**Solution:** Use `database-setup-safe.sql` - it handles dependencies correctly.

### Error: "bucket already exists"
**Solution:** Normal - the script handles existing buckets safely.

### Error: "relation already exists"
**Solution:** Use `database-setup-safe.sql` instead of `complete-database-setup.sql`.

### Performance Issues
**Solution:** Run the performance optimization section from `database-maintenance.sql`.

## ✅ Next Steps After Database Setup

1. **Update Environment Variables**: Ensure your `.env.local` has correct Supabase credentials
2. **Test File Upload**: Try uploading a test file
3. **Test File Sharing**: Create a share link and test access
4. **Test SMS/Email**: Verify Twilio integration works
5. **Set Up Monitoring**: Consider setting up automated cleanup cron jobs

---

🎉 **You're all set!** Your Zero Trust Share database is ready for secure file sharing.

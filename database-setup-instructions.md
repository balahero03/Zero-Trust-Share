# 📊 Database Schema Update Instructions

## 🎯 Quick Setup (Recommended)

### **Option 1: Run SMS Schema Update**
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the contents of `sms-schema-update.sql`
4. Click **Run** to execute
5. Verify the table was created successfully

### **Option 2: Run Complete Schema**
1. Open your **Supabase Dashboard** 
2. Go to **SQL Editor**
3. Copy and paste the entire updated `supabase-schema.sql`
4. Click **Run** to execute (this will create all tables)

## 🔍 Verification Steps

After running the SQL, verify the setup:

### **1. Check SMS Verification Table**
```sql
-- Run this query to verify the table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sms_verification' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

Expected columns:
- `id` (uuid)
- `file_id` (uuid) 
- `recipient_phone` (text)
- `recipient_id` (uuid, nullable)
- `passcode` (text)
- `expires_at` (timestamp)
- `verified_at` (timestamp, nullable)
- `attempts` (integer)
- `max_attempts` (integer)
- `created_at` (timestamp)

### **2. Check RLS Policies**
```sql
-- Verify Row Level Security policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'sms_verification';
```

### **3. Test Table Access**
```sql
-- Test basic functionality
INSERT INTO public.sms_verification (
    file_id, 
    recipient_phone, 
    passcode
) VALUES (
    gen_random_uuid(), 
    '+15551234567', 
    '123456'
);

-- Check if insert worked
SELECT count(*) FROM public.sms_verification;

-- Clean up test data
DELETE FROM public.sms_verification WHERE passcode = '123456';
```

## 🚨 Troubleshooting

### **Common Issues:**

1. **"Table already exists" error**
   - This is safe to ignore if the table structure is correct
   - The `IF NOT EXISTS` clause prevents errors

2. **Permission denied errors**
   - Make sure you're logged in as the project owner
   - Run the GRANT statements separately if needed

3. **Foreign key constraint errors**
   - Ensure the `shared_files` table exists first
   - Run the complete `supabase-schema.sql` if needed

### **Reset and Retry:**
If you encounter issues, you can drop and recreate:
```sql
-- CAUTION: This will delete all SMS verification data
DROP TABLE IF EXISTS public.sms_verification CASCADE;

-- Then re-run the sms-schema-update.sql
```

## ✅ Success Indicators

You'll know the setup worked when:
- ✅ `sms_verification` table appears in your Supabase dashboard
- ✅ All 10 expected columns are present
- ✅ RLS policies are active
- ✅ No error messages in SQL editor
- ✅ Test insert/select queries work

## 🎉 Next Steps

Once database is updated:
1. ✅ Update your `.env.local` with Twilio credentials
2. ✅ Restart your development server
3. ✅ Test the SMS functionality end-to-end
4. ✅ Monitor SMS delivery in Twilio console

---
*Need help? Check the troubleshooting section or review the complete setup guide in `SMS_PASSCODE_SETUP.md`*

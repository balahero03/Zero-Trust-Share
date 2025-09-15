# 🔧 Upload/Download Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **1. "Upload Failed" Error**

#### **Possible Causes:**
- Missing environment variables
- Supabase Storage bucket doesn't exist
- Authentication issues
- File size too large

#### **Solutions:**

**A. Check Environment Variables**
```bash
# Run this to verify your .env.local is set up
node setup-env.js
```

**B. Verify Supabase Storage Bucket**
```bash
# Test connection and bucket
node test-connection.js
```

**C. Check Browser Console**
- Open Developer Tools (F12)
- Look for error messages in Console tab
- Check Network tab for failed requests

### **2. "Download Failed" Error**

#### **Possible Causes:**
- File doesn't exist in storage
- File has expired
- File was burned after read
- Database record missing

#### **Solutions:**

**A. Check File Exists**
```bash
# Test if file is in storage
node test-connection.js
```

**B. Verify Database Record**
- Go to Supabase Dashboard → Table Editor
- Check `shared_files` table
- Look for your file record

**C. Check File Status**
- Verify `expires_at` is in the future
- Check `burn_after_read` and `download_count`

### **3. "Authentication Failed" Error**

#### **Possible Causes:**
- Invalid Supabase credentials
- Session expired
- User not authenticated

#### **Solutions:**

**A. Check Supabase Credentials**
```bash
# Verify credentials are correct
node test-connection.js
```

**B. Clear Browser Storage**
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**C. Check Supabase Auth Settings**
- Go to Supabase Dashboard → Authentication → Settings
- Verify Site URL: `http://localhost:3000`
- Check Redirect URLs include `http://localhost:3000/**`

### **4. "File Not Found" Error**

#### **Possible Causes:**
- File ID is invalid
- File was deleted
- Database and storage out of sync

#### **Solutions:**

**A. Verify File ID**
- Check the URL contains a valid UUID
- Example: `/share/550e8400-e29b-41d4-a716-446655440000`

**B. Check Database Record**
- Go to Supabase Dashboard → Table Editor
- Search for the file ID in `shared_files` table

**C. Check Storage**
- Go to Supabase Dashboard → Storage
- Look for the file in `aethervault-files` bucket

## 🧪 **Testing Steps**

### **Step 1: Test Connection**
```bash
node test-connection.js
```
**Expected Output:**
```
✅ Storage connection successful!
✅ Bucket "aethervault-files" exists!
✅ Database connection successful!
```

### **Step 2: Test Environment**
```bash
node setup-env.js
```
**Expected Output:**
```
✅ .env.local already exists
✅ Environment variables set
```

### **Step 3: Start Development Server**
```bash
npm run dev
```
**Expected Output:**
```
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### **Step 4: Test Upload**
1. Go to `http://localhost:3000`
2. Try uploading a small test file (like a text file)
3. Check browser console for any errors
4. Check Supabase Dashboard → Storage for the uploaded file

### **Step 5: Test Download**
1. Use the generated share link
2. Enter the passcode
3. Verify file downloads correctly

## 🔍 **Debug Information**

### **Check Browser Console**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check for network errors

### **Check Network Tab**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try uploading/downloading
4. Look for failed requests (red entries)
5. Click on failed requests to see error details

### **Check Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Check Storage → `aethervault-files` bucket
3. Check Table Editor → `shared_files` table
4. Check Authentication → Users

## 📋 **Quick Checklist**

- [ ] Environment variables set in `.env.local`
- [ ] Supabase Storage bucket `aethervault-files` exists
- [ ] Database table `shared_files` exists with RLS policies
- [ ] Authentication settings configured in Supabase
- [ ] Development server running on `http://localhost:3000`
- [ ] No errors in browser console
- [ ] No failed requests in Network tab

## 🆘 **Still Having Issues?**

### **1. Check Logs**
```bash
# Check if development server is running
npm run dev
```

### **2. Reset Everything**
```bash
# Clear browser storage
# In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **3. Test with Simple File**
- Try uploading a small text file first
- Use a simple filename without special characters
- Keep file size under 1MB for testing

### **4. Check Supabase Status**
- Go to [Supabase Status Page](https://status.supabase.com/)
- Verify all services are operational

### **5. Verify Database Schema**
Run this SQL in Supabase SQL Editor:
```sql
-- Check if table exists
SELECT * FROM shared_files LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'shared_files';
```

## 🎯 **Success Indicators**

When everything is working correctly, you should see:

- ✅ File upload completes without errors
- ✅ Share link is generated successfully
- ✅ File downloads when accessing share link
- ✅ Download count increments in database
- ✅ Files appear in dashboard
- ✅ No errors in browser console

---

**If you're still having issues, please share:**
1. Error messages from browser console
2. Output from `node test-connection.js`
3. Steps you've tried
4. What happens when you try to upload/download

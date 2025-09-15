# Supabase Storage Setup Guide for Zero-Trust-Share

This guide will walk you through setting up Supabase Storage for your Zero-Trust-Share project. This is much simpler than Azure and integrates seamlessly with your existing Supabase project.

## 🎯 Quick Setup (5 minutes)

### Step 1: Create Supabase Storage Bucket

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Create Storage Bucket**
   - Click **"Storage"** in the left menu
   - Click **"+ Create a new bucket"**
   - **Name**: `aethervault-files`
   - **Public**: ❌ **Unchecked** (Keep it private)
   - Click **"Create bucket"**

### Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Next.js Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Test Your Setup

```bash
# Test Supabase Storage connection
node test-supabase-storage.js
```

**Expected Output:**
```
🔍 Testing Supabase Storage Configuration...

📋 Environment Variables:
NEXT_PUBLIC_SUPABASE_URL: ✅ Set
SUPABASE_SERVICE_ROLE_KEY: ✅ Set

🔗 Testing Supabase connection...
✅ Supabase connection successful!
📦 Available buckets:
   - aethervault-files (Private)
✅ Your bucket "aethervault-files" exists!
📁 Files in bucket (0 found):
   - Bucket is empty

🎉 Supabase Storage setup looks good!
```

### Step 4: Start Development Server

```bash
npm run dev
```

## 🏗️ How It Works

### Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Your API       │    │   Supabase      │
│   (Browser)     │    │   (Next.js)      │    │   Storage       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. prepareFileUpload()│                       │
         ├──────────────────────►│                       │
         │                       │ 2. Create DB record   │
         │                       ├──────────────────────►│
         │                       │                       │
         │ 3. Returns fileName   │                       │
         │    + fileId          │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 4. uploadFileData()   │                       │
         ├──────────────────────────────────────────────►│
         │                       │                       │
         │ 5. Direct upload to   │                       │
         │    Supabase Storage   │                       │
         │                       │                       │
```

### Upload Process

1. **Prepare Upload**: Creates database record and returns file name
2. **Upload File**: Directly uploads encrypted data to Supabase Storage
3. **Download**: Retrieves file from Supabase Storage using file name

## 🔧 Configuration Details

### Storage Bucket Settings

- **Name**: `aethervault-files`
- **Access**: Private (no anonymous access)
- **File Organization**: Files stored as `{userId}/{fileId}`

### Database Schema

The `shared_files` table stores file metadata:

```sql
CREATE TABLE shared_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id),
  s3_key TEXT NOT NULL, -- File name in storage
  encrypted_file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_salt BYTEA NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  burn_after_read BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Security Features

### 1. Zero-Knowledge Architecture
- Files encrypted **before** upload
- Only encrypted data stored in Supabase
- Server never sees unencrypted content

### 2. User Isolation
- Files stored with user ID prefix
- Database enforces ownership through RLS
- Each user can only access their own files

### 3. Access Control
- Private bucket (no anonymous access)
- Database-level permissions
- Time-limited file access

## 📊 API Endpoints

### `/api/prepare-upload`
- Creates database record
- Returns file name for upload
- Verifies user authentication

### `/api/get-file-download/[fileId]`
- Returns file name for download
- Checks file permissions and expiry
- Handles burn-after-read logic

### `/api/revoke-file`
- Deletes file from storage
- Removes database record
- Verifies ownership

## 🧪 Testing Your Setup

### 1. Test Storage Connection
```bash
node test-supabase-storage.js
```

### 2. Test File Upload
1. Start development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Try uploading a test file
4. Check Supabase Dashboard → Storage to see the uploaded file

### 3. Test File Download
1. Use the generated share link
2. Verify file downloads correctly
3. Check download count increments

## 🚨 Troubleshooting

### Common Issues

#### 1. "Bucket not found" Error
- **Cause**: Bucket doesn't exist
- **Solution**: Create bucket in Supabase Dashboard

#### 2. "Permission denied" Error
- **Cause**: Wrong service role key
- **Solution**: Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

#### 3. "File not found" Error
- **Cause**: File doesn't exist in storage
- **Solution**: Check if file was uploaded successfully

#### 4. Environment Variables Not Loading
- **Cause**: Wrong file name or location
- **Solution**: Ensure file is named `.env.local` in project root

### Getting Help

1. Check Supabase Dashboard → Storage for file status
2. Review database records in `shared_files` table
3. Check browser console for error messages
4. Verify environment variables are set correctly

## 💰 Pricing

### Supabase Free Tier
- **Storage**: 1 GB
- **Bandwidth**: 2 GB egress/month
- **File Uploads**: 50 MB max per file
- **Duration**: Unlimited

### Upgrade Options
- **Pro Plan**: $25/month
  - 8 GB storage
  - 250 GB bandwidth
  - 5 GB max file size

## 🔄 Migration from Azure

If you were previously using Azure, the migration is complete:

### What Changed
- ✅ Removed Azure Blob Storage dependencies
- ✅ Updated all API routes to use Supabase Storage
- ✅ Simplified upload/download process
- ✅ Removed complex pre-signed URL generation

### What Stayed the Same
- ✅ Database schema unchanged
- ✅ Encryption/decryption process unchanged
- ✅ User interface unchanged
- ✅ Security model unchanged

## 🎯 Next Steps

1. **Test your setup** with the test script
2. **Upload a file** through your app
3. **Check Supabase Dashboard** to see the uploaded file
4. **Monitor usage** to stay within free tier limits
5. **Set up alerts** for storage usage

## 📚 Key Files

| File | Purpose |
|------|---------|
| `src/lib/storage.ts` | Frontend storage functions |
| `src/app/api/prepare-upload/route.ts` | API route for upload preparation |
| `src/app/api/get-file-download/[fileId]/route.ts` | API route for download info |
| `src/app/api/revoke-file/route.ts` | API route for file deletion |
| `test-supabase-storage.js` | Test script |
| `.env.local` | Environment configuration |

---

**Note**: Supabase Storage is much simpler than Azure and integrates seamlessly with your existing Supabase project. No additional cloud accounts or complex configurations needed!

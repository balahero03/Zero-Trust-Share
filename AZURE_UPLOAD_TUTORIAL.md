This tutorial explains how Azure file upload works in your Zero-Trust-Share application. The system uses a **two-step upload process** for security and performance.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Your API       │    │   Azure Blob    │
│   (Browser)     │    │   (Next.js)      │    │   Storage       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. prepareFileUpload()│                       │
         ├──────────────────────►│                       │
         │                       │ 2. generateUploadUrl()│
         │                       ├──────────────────────►│
         │                       │                       │
         │ 3. Returns pre-signed │                       │
         │    URL + fileId       │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 4. uploadFileData()   │                       │
         ├──────────────────────────────────────────────►│
         │                       │                       │
         │ 5. Direct upload to   │                       │
         │    Azure (bypasses    │                       │
         │    your server)       │                       │
         │                       │                       │
```

## 📋 Step-by-Step Upload Process

### Step 1: Prepare Upload (`prepareFileUpload`)

**Location**: `src/lib/storage.ts` (lines 27-67)

**What it does**:
1. Authenticates the user with Supabase
2. Calls your API route `/api/prepare-upload`
3. Gets a pre-signed URL from Azure
4. Creates a database record
5. Returns upload URL and file ID

**Code Flow**:
```typescript
// 1. Get user session
const { data: { session } } = await supabase.auth.getSession();

// 2. Call your API
const uploadResponse = await fetch('/api/prepare-upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  },
  body: JSON.stringify({
    encryptedFileName,
    fileSize,
    fileSalt: Array.from(fileSalt),
    burnAfterRead,
    expiryHours
  })
});

// 3. Return pre-signed URL and file ID
return await uploadResponse.json();
```

### Step 2: Upload File Data (`uploadFileData`)

**Location**: `src/lib/storage.ts` (lines 72-92)

**What it does**:
1. Takes the pre-signed URL from Step 1
2. **Directly uploads** to Azure Blob Storage
3. **Bypasses your server completely**
4. Uses PUT request with encrypted file data

**Code Flow**:
```typescript
// Direct upload to Azure (no API call!)
const uploadResult = await fetch(uploadUrl, {
  method: 'PUT',
  body: encryptedData,  // Raw encrypted file data
  headers: {
    'Content-Type': 'application/octet-stream',
  }
});
```

## 🔧 Azure Configuration

### Environment Variables

**File**: `.env.local`

```env
# Azure Storage Credentials
AZURE_STORAGE_ACCOUNT_NAME="aethershare"
AZURE_STORAGE_ACCOUNT_KEY="25kQ5vFVQ7lJd3XUITxcA4G94BaFlXXERwryt5KygrwLzWzEetGAP6Nb3v0Z3j+TILMmf69ybE4o+AStE80B1g=="
AZURE_STORAGE_CONTAINER_NAME="aether-share-storage"
```

### Azure Setup Functions

**Location**: `src/lib/azure.ts`

#### 1. Connection Setup (lines 8-23)
```typescript
// Initialize Azure Blob Storage client
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!

// Create shared key credential
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)

// Create blob service client
export const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
)
```

#### 2. Generate Upload URL (lines 28-53)
```typescript
export async function generateUploadUrl(
  blobName: string,
  expiresIn: number = 300 // 5 minutes
): Promise<string> {
  // Get blob client
  const blobClient = containerClient.getBlockBlobClient(blobName)
  
  // Generate SAS token for upload
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse('w'), // write permission
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + expiresIn * 1000),
    },
    sharedKeyCredential
  ).toString()

  return `${blobClient.url}?${sasToken}`
}
```

## 🔐 Security Features

### 1. Pre-signed URLs (SAS Tokens)
- **Time-limited**: URLs expire in 5 minutes
- **Permission-specific**: Only allows write operations
- **Secure**: No need to expose storage keys to frontend

### 2. User Isolation
- Files are stored with user ID prefix: `${user.id}/${fileId}`
- Each user can only access their own files
- Database enforces ownership through RLS (Row Level Security)

### 3. Encryption
- Files are encrypted **before** upload
- Only encrypted data goes to Azure
- Your server never sees unencrypted file content

## 📊 API Route: `/api/prepare-upload`

**Location**: `src/app/api/prepare-upload/route.ts`

**What it does**:
1. Verifies user authentication
2. Generates unique file ID and blob name
3. Creates Azure pre-signed URL
4. Saves file metadata to database
5. Returns upload URL and file ID

**Key Code**:
```typescript
// Generate unique blob name
const fileId = uuidv4()
const blobName = `${user.id}/${fileId}`

// Generate pre-signed upload URL (expires in 5 minutes)
const uploadUrl = await generateUploadUrl(blobName, 300)

// Create database record
const { data: fileRecord, error: dbError } = await supabaseAdmin
  .from('shared_files')
  .insert({
    owner_id: user.id,
    s3_key: blobName, // Using s3_key field for blob name
    encrypted_file_name: encryptedFileName,
    file_size: fileSize,
    file_salt: fileSalt,
    expires_at: expiresAt,
    burn_after_read: burnAfterRead,
    download_count: 0
  })
```

## 🧪 Testing Your Setup

### 1. Test Azure Connection
```bash
node test-azure-simple.js
```

**Expected Output**:
```
🔍 Testing Azure Blob Storage Configuration...

📋 Azure Credentials:
AZURE_STORAGE_ACCOUNT_NAME: ✅ Set
AZURE_STORAGE_ACCOUNT_KEY: ✅ Set
AZURE_STORAGE_CONTAINER_NAME: ✅ Set

🔗 Testing Azure connection...
✅ Azure connection successful!
📦 Available containers:
   - aether-share-storage
✅ Your container "aether-share-storage" exists!
📊 Container properties:
   - Created: 2024-01-15T10:30:00.000Z
   - Last Modified: 2024-01-15T10:30:00.000Z
   - Access Level: Private
📁 Container is empty (no blobs found)

🎉 Azure setup looks good! You can now test file uploads.
```

### 2. Test with Environment Variables
```bash
node test-azure.js
```

This version reads from your `.env.local` file.

## 🔄 Complete Upload Flow Example

### Frontend Usage:
```typescript
// 1. Prepare upload
const { uploadUrl, fileId } = await prepareFileUpload(
  encryptedFileName,
  fileSize,
  fileSalt,
  burnAfterRead,
  expiryHours
);

// 2. Upload file data directly to Azure
await uploadFileData(uploadUrl, encryptedData);

// 3. File is now stored in Azure and database record exists
```

### What Happens Behind the Scenes:

1. **Frontend** → `prepareFileUpload()` → **Your API** → **Azure** (gets pre-signed URL)
2. **Frontend** → `uploadFileData()` → **Azure directly** (uploads file)
3. **Database** already has the file record from step 1

## 🚨 Common Issues & Solutions

### 1. "AuthenticationFailed" Error
- **Cause**: Wrong Azure credentials
- **Solution**: Check `AZURE_STORAGE_ACCOUNT_NAME` and `AZURE_STORAGE_ACCOUNT_KEY`

### 2. "ContainerNotFound" Error
- **Cause**: Container doesn't exist
- **Solution**: Create container in Azure Portal or check container name

### 3. Upload URL Expires
- **Cause**: Pre-signed URL expires in 5 minutes
- **Solution**: Generate new URL if needed

### 4. File Size Limits
- **Azure Free Tier**: 5 GB total storage
- **Per File**: No specific limit, but consider performance

## 💡 Why This Design?

### Benefits:
1. **Performance**: Direct upload to Azure (faster)
2. **Security**: Pre-signed URLs (no key exposure)
3. **Scalability**: Your server doesn't handle large files
4. **Cost**: Reduced bandwidth on your server

### Trade-offs:
1. **Complexity**: Two-step process
2. **Error Handling**: Need to handle both API and Azure errors
3. **Debugging**: More moving parts

## 🔧 Customization Options

### 1. Change Upload URL Expiry
```typescript
// In generateUploadUrl function
const uploadUrl = await generateUploadUrl(blobName, 600) // 10 minutes
```

### 2. Add Custom Headers
```typescript
// In uploadFileData function
const uploadResult = await fetch(uploadUrl, {
  method: 'PUT',
  body: encryptedData,
  headers: {
    'Content-Type': 'application/octet-stream',
    'x-ms-blob-type': 'BlockBlob', // Custom Azure header
  }
});
```

### 3. Add Progress Tracking
```typescript
// You can add upload progress using fetch with ReadableStream
// This requires more complex implementation
```

## 📚 Key Files Summary

| File | Purpose |
|------|---------|
| `src/lib/storage.ts` | Frontend storage functions |
| `src/lib/azure.ts` | Azure Blob Storage utilities |
| `src/app/api/prepare-upload/route.ts` | API route for upload preparation |
| `test-azure.js` | Test script with environment variables |
| `test-azure-simple.js` | Simple test script |
| `.env.local` | Environment configuration |

## 🎯 Next Steps

1. **Test your setup** with the test scripts
2. **Upload a file** through your app
3. **Check Azure Portal** to see the uploaded file
4. **Monitor usage** to stay within free tier limits
5. **Set up alerts** for cost management

---

**Remember**: The upload process is intentionally different from other functions because it needs to bypass your server for performance and security reasons. This is a common pattern in modern cloud applications!

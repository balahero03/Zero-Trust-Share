# Azure Free Tier Setup Guide for Zero-Trust-Share

This guide will walk you through setting up Azure Free Tier for your Zero-Trust-Share project, including Blob Storage for secure file sharing.

## Table of Contents
1. [Azure Account Setup](#azure-account-setup)
2. [Storage Account Creation](#storage-account-creation)
3. [Container Setup](#container-setup)
4. [Environment Configuration](#environment-configuration)
5. [Testing Your Setup](#testing-your-setup)
6. [Free Tier Limits](#free-tier-limits)
7. [Troubleshooting](#troubleshooting)

## Azure Account Setup

### Step 1: Create Azure Account
1. Go to [Azure Free Account](https://azure.microsoft.com/en-us/free/)
2. Click "Start free" or "Create your free Azure account today"
3. Sign in with your Microsoft account (or create one)
4. Enter your phone number for verification
5. Provide your credit card information (required for verification, but you won't be charged for Free Tier usage)

### Step 2: Account Verification
1. Azure will verify your identity via phone
2. You may need to verify your credit card (small temporary charge that gets refunded)
3. Complete the verification process

### Step 3: Access Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with your Microsoft account
3. You'll see the Azure dashboard

## Storage Account Creation

### Step 1: Create Storage Account
1. In Azure Portal, click "Create a resource"
2. Search for "Storage account" and select it
3. Click "Create"

### Step 2: Configure Storage Account
1. **Subscription**: Select your subscription (Free Trial)
2. **Resource Group**: 
   - Click "Create new"
   - Name: `aethervault-rg`
   - Click "OK"
3. **Storage account name**: 
   - Enter a unique name (e.g., `aethervaultstorage123`)
   - Must be 3-24 characters, lowercase letters and numbers only
   - Must be globally unique
4. **Region**: Choose a region close to you (e.g., `East US`)
5. **Performance**: Select "Standard"
6. **Redundancy**: Select "Locally-redundant storage (LRS)" (cheapest option)
7. Click "Review + create"

### Step 3: Review and Create
1. Review your settings
2. Click "Create"
3. Wait for deployment to complete (usually 1-2 minutes)
4. Click "Go to resource"

### Step 4: Get Access Keys
1. In your storage account, go to "Access keys" in the left menu
2. Click "Show keys"
3. Copy the following values:
   - **Storage account name** (you already know this)
   - **Key 1** (this is your account key)
   - **Connection string** (optional, but useful for testing)

## Container Setup

### Step 1: Create Container
1. In your storage account, go to "Containers" in the left menu
2. Click "+ Container"
3. **Name**: `aethervault-files`
4. **Public access level**: Select "Private (no anonymous access)"
5. Click "Create"

### Step 2: Configure Container (Optional)
1. Click on your container name
2. Go to "Access policy" tab
3. You can configure access policies if needed (for now, keep it private)

## Environment Configuration

### Step 1: Create Environment File
1. Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```

### Step 2: Update Environment Variables
Edit `.env.local` with your Azure credentials:

```env
# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# Azure Storage Credentials (for backend use only)
AZURE_STORAGE_ACCOUNT_NAME="aethershare"
AZURE_STORAGE_ACCOUNT_KEY="25kQ5vFVQ7lJd3XUITxcA4G94BaFlXXERwryt5KygrwLzWzEetGAP6Nb3v0Z3j+TILMmf69ybE4o+AStE80B1g=="
AZURE_STORAGE_CONTAINER_NAME="aether-share-storage"

# Next.js Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Secure Your Environment File
- Never commit `.env.local` to version control
- Add `.env.local` to your `.gitignore` file

## Testing Your Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Azure Test Script
```bash
node test-azure.js
```

This will:
- Verify your environment variables are set
- Test Azure connection
- List available containers
- Check if your container exists
- Show container properties

### Step 3: Expected Output
You should see:
```
🔍 Testing Azure Blob Storage Configuration...

📋 Environment Variables:
AZURE_STORAGE_ACCOUNT_NAME: ✅ Set
AZURE_STORAGE_ACCOUNT_KEY: ✅ Set
AZURE_STORAGE_CONTAINER_NAME: aethervault-files

🔗 Testing Azure connection...
✅ Azure connection successful!
📦 Available containers:
   - aethervault-files
✅ Your container "aethervault-files" exists!
📊 Container properties:
   - Created: 2024-01-15T10:30:00.000Z
   - Last Modified: 2024-01-15T10:30:00.000Z
   - Access Level: Private
📁 Container is empty (no blobs found)

🎉 Azure setup looks good! You can now test file uploads.
```

### Step 4: Test File Upload
1. Start your development server:
```bash
npm run dev
```
2. Go to `http://localhost:3000`
3. Try uploading a test file

## Free Tier Limits

### Azure Free Tier Includes:
- **Storage**: 5 GB of LRS blob storage
- **Transactions**: 20,000 transactions per month
- **Data Transfer**: 5 GB of egress per month
- **Duration**: 12 months from signup

### Monitoring Usage:
1. Go to Azure Portal
2. Navigate to "Cost Management + Billing"
3. Click "Cost analysis"
4. Monitor your usage to avoid charges

### Cost Optimization Tips:
- Use LRS (Locally-redundant storage) for development
- Set up lifecycle policies to automatically delete old files
- Monitor your usage regularly
- Use Azure Cost Management alerts

## Troubleshooting

### Common Issues:

#### 1. "AuthenticationFailed" Error
- **Cause**: Wrong account name or key
- **Solution**: Double-check your `AZURE_STORAGE_ACCOUNT_NAME` and `AZURE_STORAGE_ACCOUNT_KEY` in `.env.local`

#### 2. "AccountNotFound" Error
- **Cause**: Wrong storage account name
- **Solution**: Verify your storage account name in Azure Portal

#### 3. "ContainerNotFound" Error
- **Cause**: Container doesn't exist or wrong name
- **Solution**: Create the container in Azure Portal or check the container name

#### 4. "Forbidden" Error
- **Cause**: Wrong access key or insufficient permissions
- **Solution**: Check your storage account key and ensure you have proper permissions

#### 5. Environment Variables Not Loading
- **Cause**: Wrong file name or location
- **Solution**: Ensure file is named `.env.local` in project root

### Getting Help:
1. Check Azure Activity Log for detailed error information
2. Review storage account access keys in Azure Portal
3. Verify container exists and is accessible
4. Test with Azure Storage Explorer

## Security Best Practices

### 1. Access Keys
- Rotate access keys regularly
- Use Azure Key Vault for production
- Never commit keys to version control

### 2. Container Security
- Keep containers private by default
- Use Shared Access Signatures (SAS) for temporary access
- Implement proper access policies

### 3. Environment Security
- Never commit credentials to version control
- Use Azure Managed Identity for production
- Regularly rotate access keys

## Code Changes Made

### Files Updated:
1. **`src/lib/azure.ts`** - New Azure Blob Storage library
2. **`src/app/api/prepare-upload/route.ts`** - Updated to use Azure
3. **`src/app/api/get-file-download/[fileId]/route.ts`** - Updated to use Azure
4. **`src/app/api/revoke-file/route.ts`** - Updated to use Azure
5. **`package.json`** - Updated dependencies
6. **`env.example`** - Updated environment variables
7. **`test-azure.js`** - New Azure test script

### Key Changes:
- Replaced AWS S3 SDK with Azure Blob Storage SDK
- Updated all API routes to use Azure functions
- Changed environment variables from AWS to Azure
- Maintained the same database schema (using `s3_key` field for blob names)

## Next Steps

Once your Azure setup is complete:
1. Test file uploads and downloads
2. Configure your Supabase database
3. Set up email notifications
4. Deploy to production

## Additional Resources

- [Azure Free Tier Documentation](https://azure.microsoft.com/en-us/free/)
- [Azure Blob Storage Pricing](https://azure.microsoft.com/en-us/pricing/details/storage/blobs/)
- [Azure Storage Security Best Practices](https://docs.microsoft.com/en-us/azure/storage/common/storage-security-guide)
- [Azure Blob Storage REST API](https://docs.microsoft.com/en-us/rest/api/storageservices/blob-service-rest-api)

---

**Note**: This setup uses Azure Free Tier which is sufficient for development and small-scale usage. Monitor your usage to avoid unexpected charges.

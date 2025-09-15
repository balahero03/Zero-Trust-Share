# AWS Free Tier Setup Guide for Zero-Trust-Share

This guide will walk you through setting up AWS Free Tier for your Zero-Trust-Share project, including S3 storage for secure file sharing.

## Table of Contents
1. [AWS Account Setup](#aws-account-setup)
2. [IAM User Creation](#iam-user-creation)
3. [S3 Bucket Setup](#s3-bucket-setup)
4. [Environment Configuration](#environment-configuration)
5. [Testing Your Setup](#testing-your-setup)
6. [Free Tier Limits](#free-tier-limits)
7. [Troubleshooting](#troubleshooting)

## AWS Account Setup

### Step 1: Create AWS Account
1. Go to [AWS Free Tier](https://aws.amazon.com/free/)
2. Click "Create Free Account"
3. Enter your email address and choose a password
4. Choose "Personal" account type
5. Fill in your contact information

### Step 2: Payment Information
- **Important**: AWS requires a credit card for verification, but you won't be charged for Free Tier usage
- Enter your payment information (required for account verification)
- AWS will verify your identity (may take a few minutes)

### Step 3: Choose Support Plan
- Select "Basic Support - Free" (this is sufficient for Free Tier)

### Step 4: Account Verification
- AWS will send a verification code to your phone
- Enter the code to complete account setup

## IAM User Creation

### Step 1: Access IAM Console
1. Sign in to AWS Console
2. Search for "IAM" in the services search bar
3. Click on "IAM" (Identity and Access Management)

### Step 2: Create IAM User
1. In the IAM dashboard, click "Users" in the left sidebar
2. Click "Create user"
3. Enter username: `aethervault-s3-user` (or your preferred name)
4. Select "Programmatic access" (this gives you access keys)
5. Click "Next: Permissions"

### Step 3: Attach S3 Policy
1. Click "Attach existing policies directly"
2. Search for and select: `AmazonS3FullAccess`
   - **Note**: For production, create a custom policy with minimal permissions
3. Click "Next: Tags" (optional)
4. Click "Next: Review"
5. Click "Create user"

### Step 4: Save Access Keys
1. **IMPORTANT**: Copy and save your Access Key ID and Secret Access Key
2. Click "Download .csv" to save credentials securely
3. Store these credentials safely - you won't be able to see the secret key again

## S3 Bucket Setup

### Step 1: Create S3 Bucket
1. Go to S3 service in AWS Console
2. Click "Create bucket"
3. Enter bucket name: `aethervault-files-[your-unique-id]` (must be globally unique)
4. Choose region: `us-east-1` (or your preferred region)
5. Click "Next"

### Step 2: Configure Bucket Settings
1. **Versioning**: Leave disabled (Free Tier includes 1,000 PUT requests)
2. **Server-side encryption**: Enable "AES-256" (free)
3. **Block Public Access**: Keep all settings enabled (recommended for security)
4. Click "Next"

### Step 3: Set Permissions
1. **Bucket Policy**: Leave empty (we'll use IAM user permissions)
2. **Access Control List**: Leave default settings
3. Click "Next"

### Step 4: Review and Create
1. Review your settings
2. Click "Create bucket"

### Step 5: Configure CORS (Optional)
If you plan to upload files directly from the browser:
1. Click on your bucket name
2. Go to "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Click "Edit" and add:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "ExposeHeaders": ["ETag"]
    }
]
```

## Environment Configuration

### Step 1: Create Environment File
1. Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```

### Step 2: Update Environment Variables
Edit `.env.local` with your AWS credentials:

```env
# AWS Credentials (for backend use only)
AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID_FROM_IAM_USER"
AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY_FROM_IAM_USER"
AWS_S3_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name-here"
```

### Step 3: Secure Your Environment File
- Never commit `.env.local` to version control
- Add `.env.local` to your `.gitignore` file

## Testing Your Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run AWS Test Script
```bash
node test-aws.js
```

This will:
- Verify your environment variables are set
- Test AWS connection
- List available buckets
- Check if your bucket exists

### Step 3: Expected Output
You should see:
```
🔍 Testing AWS S3 Configuration...

📋 Environment Variables:
AWS_ACCESS_KEY_ID: ✅ Set
AWS_SECRET_ACCESS_KEY: ✅ Set
AWS_S3_REGION: us-east-1
AWS_S3_BUCKET_NAME: your-bucket-name

🔗 Testing AWS connection...
✅ AWS connection successful!
📦 Available buckets:
   - your-bucket-name (created: 2024-01-01T00:00:00.000Z)
✅ Your bucket "your-bucket-name" exists!

🎉 AWS setup looks good! You can now test file uploads.
```

### Step 4: Test File Upload
1. Start your development server:
```bash
npm run dev
```
2. Go to `http://localhost:3000`
3. Try uploading a test file

## Free Tier Limits

### S3 Free Tier Includes:
- **Storage**: 5 GB of standard storage
- **Requests**: 20,000 GET requests and 2,000 PUT requests per month
- **Data Transfer**: 15 GB of data transfer out per month

### Monitoring Usage:
1. Go to AWS Billing Dashboard
2. Click "Free Tier" in the left sidebar
3. Monitor your usage to avoid charges

### Cost Optimization Tips:
- Use S3 Standard-IA for infrequently accessed files (after Free Tier)
- Set up lifecycle policies to automatically delete old files
- Monitor your usage regularly

## Troubleshooting

### Common Issues:

#### 1. "InvalidAccessKeyId" Error
- **Cause**: Wrong Access Key ID
- **Solution**: Double-check your `AWS_ACCESS_KEY_ID` in `.env.local`

#### 2. "SignatureDoesNotMatch" Error
- **Cause**: Wrong Secret Access Key
- **Solution**: Double-check your `AWS_SECRET_ACCESS_KEY` in `.env.local`

#### 3. "NoSuchBucket" Error
- **Cause**: Bucket doesn't exist or wrong bucket name
- **Solution**: Verify bucket name in AWS S3 console and `.env.local`

#### 4. "Access Denied" Error
- **Cause**: IAM user doesn't have S3 permissions
- **Solution**: Attach `AmazonS3FullAccess` policy to your IAM user

#### 5. Environment Variables Not Loading
- **Cause**: Wrong file name or location
- **Solution**: Ensure file is named `.env.local` in project root

### Getting Help:
1. Check AWS CloudTrail for detailed error logs
2. Review IAM user permissions in AWS Console
3. Verify bucket exists and is in the correct region
4. Test with AWS CLI: `aws s3 ls`

## Security Best Practices

### 1. IAM Permissions
- Use least privilege principle
- Create custom policies instead of using full access
- Rotate access keys regularly

### 2. Bucket Security
- Keep public access blocked
- Enable server-side encryption
- Use bucket policies for additional security

### 3. Environment Security
- Never commit credentials to version control
- Use AWS Secrets Manager for production
- Regularly rotate access keys

## Next Steps

Once your AWS setup is complete:
1. Test file uploads and downloads
2. Configure your Supabase database
3. Set up email notifications
4. Deploy to production

## Additional Resources

- [AWS Free Tier Documentation](https://aws.amazon.com/free/)
- [S3 Pricing Calculator](https://calculator.aws/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)

---

**Note**: This setup uses AWS Free Tier which is sufficient for development and small-scale usage. Monitor your usage to avoid unexpected charges.

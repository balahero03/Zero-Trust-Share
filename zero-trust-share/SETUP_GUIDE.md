# AetherVault Setup Guide

This guide will help you set up the complete AetherVault zero-knowledge file sharing system.

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- An AWS account with S3 access

## 1. Install Dependencies

First, install the required packages:

```bash
npm install @supabase/supabase-js @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid
npm install --save-dev @types/uuid
```

## 2. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready
3. Go to Settings > API to get your credentials

### Set up the Database

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql` into the editor
3. Run the SQL to create the database schema

### Get Supabase Credentials

From your Supabase project settings:
- Project URL
- Anon (public) key
- Service role key (keep this secret!)

## 3. AWS S3 Setup

### Create an S3 Bucket

1. Go to the AWS S3 console
2. Create a new bucket with a unique name (e.g., `your-unique-aethervault-bucket`)
3. **Important**: Keep "Block all public access" turned ON
4. Note the bucket name and region

### Configure CORS

In your S3 bucket's Permissions tab, add this CORS configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET"],
        "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
        "ExposeHeaders": []
    }
]
```

### Create IAM User

1. Go to AWS IAM console
2. Create a new user with programmatic access
3. Attach a custom policy with these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

4. Save the Access Key ID and Secret Access Key

## 4. Environment Configuration

Create a `.env.local` file in your project root with these variables:

```env
# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# AWS Credentials
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_S3_REGION="your-s3-bucket-region"
AWS_S3_BUCKET_NAME="your-s3-bucket-name"

# Next.js Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 6. Test the System

1. **Sign Up**: Create a new account
2. **Upload a File**: 
   - Select a file
   - Set a file passcode
   - Choose burn-after-read and expiry options
   - Upload the file
3. **Share**: Copy the share link
4. **Download**: Open the share link in an incognito window and download with the passcode
5. **Dashboard**: View your uploaded files and revoke access

## Security Features

### Zero-Knowledge Architecture
- All encryption happens client-side
- Server never sees unencrypted data or passwords
- File names are encrypted with user's master key
- File content is encrypted with file-specific passcode

### Key Derivation
- Master keys derived from user passwords using PBKDF2
- File keys derived from file passcodes using PBKDF2
- 100,000 iterations for strong key derivation

### Secure Storage
- Files stored as encrypted blobs in AWS S3
- Pre-signed URLs for direct client-to-S3 upload/download
- Database only stores encrypted metadata

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your S3 bucket CORS policy includes your domain
2. **Authentication Errors**: Verify your Supabase credentials
3. **Upload Failures**: Check your AWS credentials and bucket permissions
4. **Database Errors**: Ensure the Supabase schema was created correctly

### Debug Mode

Set `NODE_ENV=development` to see detailed error logs.

## Production Deployment

1. Update CORS origins in S3 bucket
2. Set production URLs in environment variables
3. Use environment-specific Supabase projects
4. Enable HTTPS for all endpoints
5. Set up proper monitoring and logging

## Support

For issues or questions, refer to the documentation or create an issue in the repository.

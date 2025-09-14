# Zero Trust Share - AWS Backend Deployment Guide

This guide will help you deploy the complete AWS backend infrastructure for the Zero Trust Share platform.

## 🏗️ Architecture Overview

The AWS backend consists of:

- **S3 Buckets**: Encrypted file storage and metadata backup
- **DynamoDB Tables**: File metadata and user session management
- **Lambda Functions**: Serverless API endpoints for all operations
- **API Gateway**: RESTful API with CORS support
- **CloudFront**: Global content delivery network
- **IAM Roles**: Secure access control

## 📋 Prerequisites

### 1. AWS Account Setup
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js 18+ installed
- AWS CDK installed globally

### 2. Install Dependencies
```bash
# Install AWS CDK globally
npm install -g aws-cdk

# Install AWS CLI (if not already installed)
# Windows: Download from AWS website
# macOS: brew install awscli
# Linux: sudo apt-get install awscli
```

### 3. Configure AWS Credentials
```bash
aws configure
# Enter your Access Key ID, Secret Access Key, Region, and Output format
```

## 🚀 Quick Deployment

### Option 1: Automated Deployment
```bash
cd zero-trust-share/aws
./deploy.sh
```

### Option 2: Manual Deployment
```bash
cd zero-trust-share/aws

# Install dependencies
npm install
cd lambda && npm install && cd ..

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy the stack
cdk deploy
```

## 🔧 Configuration

### Environment Variables
After deployment, update your frontend environment variables:

```env
# .env.local
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com/prod
NEXT_PUBLIC_CLOUDFRONT_URL=https://your-cloudfront-url.cloudfront.net
AWS_REGION=us-east-1
```

### S3 Bucket Configuration
The deployment creates two S3 buckets:
- `zero-trust-files-{account}-{region}`: Encrypted file storage
- `zero-trust-metadata-{account}-{region}`: Metadata backup

### DynamoDB Tables
- `ZeroTrustFileMetadata`: File metadata and TTL management
- `ZeroTrustUserSessions`: User authentication and sessions

## 📊 Monitoring and Logs

### CloudWatch Logs
```bash
# View Lambda function logs
aws logs tail /aws/lambda/ZeroTrustShareStack-UploadFunction --follow

# View API Gateway logs
aws logs tail /aws/apigateway/ZeroTrustApi --follow
```

### CloudWatch Metrics
- Monitor Lambda invocations, errors, and duration
- Track API Gateway request counts and latency
- Monitor S3 storage usage and requests
- Track DynamoDB read/write capacity

## 🔒 Security Configuration

### IAM Policies
The deployment creates minimal IAM policies with least privilege access:
- Lambda functions can only access required S3 buckets and DynamoDB tables
- No cross-account access
- No unnecessary permissions

### S3 Security
- Buckets are private by default
- Encryption at rest enabled
- CORS configured for web access
- Lifecycle policies for automatic cleanup

### API Security
- CORS configured for web applications
- JWT-based authentication
- Rate limiting through API Gateway
- Input validation in Lambda functions

## 🛠️ Customization

### Custom Domain
To use a custom domain with CloudFront:

1. Create a certificate in AWS Certificate Manager
2. Update the CloudFront distribution configuration
3. Add your domain to the CORS configuration

### Environment-Specific Configuration
Modify `aws/infrastructure.ts` to customize:
- Bucket names
- Table names
- Lambda function timeouts
- CloudFront settings
- IAM policies

### Scaling Configuration
- DynamoDB uses on-demand billing
- Lambda functions auto-scale
- S3 scales automatically
- CloudFront provides global distribution

## 📈 Cost Optimization

### Estimated Monthly Costs (US East 1)
- **S3 Storage**: ~$0.023 per GB
- **DynamoDB**: ~$1.25 per million requests
- **Lambda**: ~$0.20 per million requests
- **API Gateway**: ~$3.50 per million requests
- **CloudFront**: ~$0.085 per GB transferred

### Cost Optimization Tips
1. Set up S3 lifecycle policies to delete old files
2. Use DynamoDB on-demand billing for variable workloads
3. Monitor CloudWatch metrics for unused resources
4. Set up billing alerts

## 🔄 Updates and Maintenance

### Updating the Stack
```bash
cd zero-trust-share/aws
cdk deploy
```

### Rolling Back Changes
```bash
cdk rollback
```

### Destroying the Stack
```bash
cdk destroy
# Note: This will delete all data!
```

## 🐛 Troubleshooting

### Common Issues

#### 1. CDK Bootstrap Error
```bash
cdk bootstrap aws://{account-id}/{region}
```

#### 2. Permission Denied
Ensure your AWS credentials have sufficient permissions:
- CloudFormation
- S3
- DynamoDB
- Lambda
- API Gateway
- CloudFront
- IAM

#### 3. Lambda Function Errors
Check CloudWatch logs for detailed error messages:
```bash
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/ZeroTrustShareStack
```

#### 4. CORS Issues
Ensure your frontend domain is included in the CORS configuration in `infrastructure.ts`.

### Debug Mode
Enable debug logging:
```bash
export CDK_DEBUG=true
cdk deploy
```

## 📚 API Documentation

### Endpoints

#### Authentication
- `POST /auth` - Register/Login
- `GET /auth` - Verify token
- `POST /auth` (with logout action) - Logout

#### File Operations
- `POST /upload` - Get upload URL
- `GET /file/{id}` - Get download URL
- `GET /file/{id}/metadata` - Get file metadata
- `DELETE /file/{id}` - Delete file

### Request/Response Examples

#### Upload File
```json
POST /upload
{
  "fileId": "optional-uuid",
  "metadata": {
    "originalName": "document.pdf",
    "originalSize": 1024000,
    "burnAfterRead": true,
    "expiryHours": 24,
    "iv": [1, 2, 3, ...],
    "uploadedAt": "2024-01-01T00:00:00Z",
    "expiresAt": "2024-01-02T00:00:00Z"
  }
}
```

#### Download File
```json
GET /file/{fileId}
Response:
{
  "downloadUrl": "https://s3.amazonaws.com/...",
  "fileId": "uuid",
  "metadata": {
    "originalName": "document.pdf",
    "originalSize": 1024000,
    "burnAfterRead": true,
    "expiresAt": "2024-01-02T00:00:00Z"
  }
}
```

## 🎯 Production Checklist

- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Configure monitoring and alerts
- [ ] Set up backup strategies
- [ ] Configure security scanning
- [ ] Set up log aggregation
- [ ] Configure auto-scaling policies
- [ ] Set up disaster recovery
- [ ] Configure compliance monitoring
- [ ] Set up cost monitoring

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review AWS CloudWatch logs
3. Check the GitHub issues
4. Contact the development team

---

**Note**: This deployment creates production-ready infrastructure. Make sure to review all security settings and customize them according to your organization's requirements.

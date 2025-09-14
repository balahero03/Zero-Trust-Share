# Zero Trust Share - AWS Backend

Complete AWS serverless backend infrastructure for the Zero Trust Share platform.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   API Gateway    │────│   Lambda        │
│   (CDN)         │    │   (REST API)     │    │   Functions     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                       ┌─────────────────────────────────┼─────────────────────────────────┐
                       │                                 │                                 │
              ┌────────▼────────┐              ┌────────▼────────┐              ┌────────▼────────┐
              │   S3 Buckets    │              │   DynamoDB      │              │   CloudWatch    │
              │   - Files       │              │   - Metadata    │              │   - Logs        │
              │   - Metadata    │              │   - Sessions    │              │   - Metrics     │
              └─────────────────┘              └─────────────────┘              └─────────────────┘
```

## 📁 Project Structure

```
aws/
├── infrastructure.ts      # CDK infrastructure definition
├── app.ts                # CDK app entry point
├── cdk.json              # CDK configuration
├── package.json          # CDK dependencies
├── tsconfig.json         # TypeScript configuration
├── deploy.sh             # Deployment script
├── README.md             # This file
├── aws-config.example    # Environment configuration template
└── lambda/               # Lambda function source code
    ├── upload.ts         # File upload handler
    ├── download.ts       # File download handler
    ├── metadata.ts       # File metadata handler
    ├── delete.ts         # File deletion handler
    ├── auth.ts           # Authentication handler
    └── package.json      # Lambda dependencies
```

## 🚀 Quick Start

### Prerequisites
- AWS CLI configured
- Node.js 18+
- AWS CDK installed globally

### Deployment
```bash
# Clone and navigate to AWS directory
cd zero-trust-share/aws

# Install dependencies
npm install
cd lambda && npm install && cd ..

# Deploy infrastructure
./deploy.sh
```

## 🔧 Configuration

### Environment Variables
After deployment, configure your frontend with the AWS endpoints:

```env
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com/prod
NEXT_PUBLIC_CLOUDFRONT_URL=https://your-cloudfront-url.cloudfront.net
AWS_REGION=us-east-1
```

### Customization
Modify `infrastructure.ts` to customize:
- Resource names
- Lambda function settings
- S3 bucket policies
- DynamoDB table configuration
- CloudFront distribution settings

## 📊 Services Overview

### S3 Buckets
- **File Bucket**: Stores encrypted files
- **Metadata Bucket**: Backup metadata storage
- **Features**: Versioning, encryption, lifecycle policies

### DynamoDB Tables
- **FileMetadata**: File information and TTL
- **UserSessions**: Authentication and session management
- **Features**: On-demand billing, TTL, encryption

### Lambda Functions
- **Upload**: Generate pre-signed URLs for file upload
- **Download**: Generate pre-signed URLs for file download
- **Metadata**: Retrieve file metadata
- **Delete**: Delete files and metadata
- **Auth**: User authentication and session management

### API Gateway
- **RESTful API**: Clean, RESTful endpoints
- **CORS**: Configured for web applications
- **Authentication**: JWT-based auth
- **Rate Limiting**: Built-in throttling

### CloudFront
- **Global CDN**: Fast content delivery worldwide
- **Custom Origins**: S3 and API Gateway
- **Caching**: Optimized caching policies
- **HTTPS**: SSL/TLS encryption

## 🔒 Security Features

### Data Protection
- **Encryption at Rest**: S3 and DynamoDB encryption
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Client-Side Encryption**: Files encrypted before upload
- **Zero-Knowledge**: Server never sees file contents

### Access Control
- **IAM Roles**: Least privilege access
- **JWT Authentication**: Secure token-based auth
- **CORS Configuration**: Controlled cross-origin access
- **API Rate Limiting**: Protection against abuse

### Compliance
- **SOC 2**: AWS infrastructure compliance
- **GDPR Ready**: Data protection features
- **Audit Logging**: CloudTrail integration
- **Monitoring**: CloudWatch comprehensive monitoring

## 📈 Monitoring and Observability

### CloudWatch Metrics
- Lambda invocations, errors, duration
- API Gateway request counts, latency
- S3 storage usage, requests
- DynamoDB read/write capacity

### CloudWatch Logs
- Lambda function logs
- API Gateway access logs
- Application-specific logs
- Error tracking and debugging

### Alarms and Notifications
- Error rate monitoring
- Performance thresholds
- Cost monitoring
- Security event alerts

## 💰 Cost Optimization

### Estimated Monthly Costs (US East 1)
- **S3 Storage**: ~$0.023 per GB
- **DynamoDB**: ~$1.25 per million requests
- **Lambda**: ~$0.20 per million requests
- **API Gateway**: ~$3.50 per million requests
- **CloudFront**: ~$0.085 per GB transferred

### Cost Optimization Strategies
1. **S3 Lifecycle Policies**: Automatic cleanup of old files
2. **DynamoDB On-Demand**: Pay per request for variable workloads
3. **Lambda Optimization**: Right-size function memory and timeout
4. **CloudFront Caching**: Reduce origin requests
5. **Monitoring**: Track and optimize resource usage

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install
cd lambda && npm install && cd ..

# Build TypeScript
npm run build

# Deploy to development
cdk deploy --profile dev
```

### Testing
```bash
# Run CDK tests
npm test

# Test Lambda functions locally
cd lambda
npm test
```

### Debugging
```bash
# Enable debug mode
export CDK_DEBUG=true
cdk deploy

# View logs
aws logs tail /aws/lambda/ZeroTrustShareStack-UploadFunction --follow
```

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
name: Deploy AWS Infrastructure
on:
  push:
    branches: [main]
    paths: ['aws/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install -g aws-cdk
      - run: cd aws && npm install
      - run: cd aws && cdk deploy --require-approval never
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### AWS CodePipeline
- Automated deployment pipeline
- Environment promotion
- Rollback capabilities
- Approval gates

## 🚨 Troubleshooting

### Common Issues

#### 1. CDK Bootstrap Error
```bash
cdk bootstrap aws://{account-id}/{region}
```

#### 2. Permission Denied
Ensure AWS credentials have sufficient permissions for:
- CloudFormation
- S3, DynamoDB, Lambda, API Gateway, CloudFront, IAM

#### 3. Lambda Function Errors
Check CloudWatch logs:
```bash
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/ZeroTrustShareStack
```

#### 4. CORS Issues
Verify CORS configuration in `infrastructure.ts` includes your frontend domain.

### Debug Commands
```bash
# List all stacks
cdk list

# View stack differences
cdk diff

# View stack outputs
cdk outputs

# Destroy stack (careful!)
cdk destroy
```

## 📚 API Reference

### Authentication Endpoints
- `POST /auth` - Register/Login user
- `GET /auth` - Verify JWT token
- `POST /auth` (logout) - Logout user

### File Management Endpoints
- `POST /upload` - Get pre-signed upload URL
- `GET /file/{id}` - Get pre-signed download URL
- `GET /file/{id}/metadata` - Get file metadata
- `DELETE /file/{id}` - Delete file

### Request/Response Examples
See `AWS_DEPLOYMENT.md` for detailed API documentation.

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
1. Check the troubleshooting section
2. Review CloudWatch logs
3. Check GitHub issues
4. Contact the development team

---

**Built with ❤️ using AWS CDK and TypeScript**

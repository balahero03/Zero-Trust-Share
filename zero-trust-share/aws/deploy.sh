#!/bin/bash

# Zero Trust Share - AWS Deployment Script
# This script deploys the complete AWS infrastructure for the Zero Trust Share platform

set -e

echo "🚀 Starting Zero Trust Share AWS Deployment..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo "❌ AWS CDK is not installed. Installing..."
    npm install -g aws-cdk
fi

# Check AWS credentials
echo "🔐 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Get AWS account info
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)
echo "✅ AWS Account: $ACCOUNT_ID"
echo "✅ AWS Region: $REGION"

# Install dependencies
echo "📦 Installing dependencies..."
cd aws
npm install

# Install Lambda dependencies
echo "📦 Installing Lambda dependencies..."
cd lambda
npm install
cd ..

# Bootstrap CDK (if needed)
echo "🔧 Bootstrapping CDK..."
cdk bootstrap aws://$ACCOUNT_ID/$REGION

# Deploy the stack
echo "🚀 Deploying Zero Trust Share infrastructure..."
cdk deploy --require-approval never

# Get stack outputs
echo "📋 Getting deployment outputs..."
cdk list

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your frontend environment variables with the API Gateway URL"
echo "2. Configure your S3 bucket policies if needed"
echo "3. Set up CloudFront custom domain (optional)"
echo "4. Configure monitoring and alerts"
echo ""
echo "🔗 Useful commands:"
echo "- View stack: cdk list"
echo "- Destroy stack: cdk destroy"
echo "- View logs: aws logs tail /aws/lambda/ZeroTrustShareStack-*"

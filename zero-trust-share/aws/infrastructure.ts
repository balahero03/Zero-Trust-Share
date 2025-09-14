import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class ZeroTrustShareStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for encrypted file storage
    const fileBucket = new s3.Bucket(this, 'ZeroTrustFileBucket', {
      bucketName: `zero-trust-files-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [
        {
          id: 'DeleteIncompleteMultipartUploads',
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        },
        {
          id: 'DeleteExpiredFiles',
          expiration: cdk.Duration.days(30),
          expiredObjectDeleteMarker: true,
        },
      ],
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.DELETE],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // S3 Bucket for metadata storage
    const metadataBucket = new s3.Bucket(this, 'ZeroTrustMetadataBucket', {
      bucketName: `zero-trust-metadata-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [
        {
          id: 'DeleteExpiredMetadata',
          expiration: cdk.Duration.days(30),
        },
      ],
    });

    // DynamoDB table for file metadata
    const fileMetadataTable = new dynamodb.Table(this, 'FileMetadataTable', {
      tableName: 'ZeroTrustFileMetadata',
      partitionKey: { name: 'fileId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // DynamoDB table for user sessions
    const userSessionsTable = new dynamodb.Table(this, 'UserSessionsTable', {
      tableName: 'ZeroTrustUserSessions',
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // IAM role for Lambda functions
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
                's3:GetObjectVersion',
                's3:DeleteObjectVersion',
              ],
              resources: [
                fileBucket.bucketArn + '/*',
                metadataBucket.bucketArn + '/*',
              ],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:ListBucket'],
              resources: [fileBucket.bucketArn, metadataBucket.bucketArn],
            }),
          ],
        }),
        DynamoDBAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan',
              ],
              resources: [
                fileMetadataTable.tableArn,
                userSessionsTable.tableArn,
              ],
            }),
          ],
        }),
      ],
    });

    // Lambda function for file upload
    const uploadLambda = new lambda.Function(this, 'UploadFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'upload.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      environment: {
        FILE_BUCKET: fileBucket.bucketName,
        METADATA_BUCKET: metadataBucket.bucketName,
        METADATA_TABLE: fileMetadataTable.tableName,
        SESSIONS_TABLE: userSessionsTable.tableName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Lambda function for file download
    const downloadLambda = new lambda.Function(this, 'DownloadFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'download.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      environment: {
        FILE_BUCKET: fileBucket.bucketName,
        METADATA_BUCKET: metadataBucket.bucketName,
        METADATA_TABLE: fileMetadataTable.tableName,
        SESSIONS_TABLE: userSessionsTable.tableName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Lambda function for file metadata
    const metadataLambda = new lambda.Function(this, 'MetadataFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'metadata.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      environment: {
        FILE_BUCKET: fileBucket.bucketName,
        METADATA_BUCKET: metadataBucket.bucketName,
        METADATA_TABLE: fileMetadataTable.tableName,
        SESSIONS_TABLE: userSessionsTable.tableName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Lambda function for file deletion
    const deleteLambda = new lambda.Function(this, 'DeleteFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'delete.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      environment: {
        FILE_BUCKET: fileBucket.bucketName,
        METADATA_BUCKET: metadataBucket.bucketName,
        METADATA_TABLE: fileMetadataTable.tableName,
        SESSIONS_TABLE: userSessionsTable.tableName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Lambda function for authentication
    const authLambda = new lambda.Function(this, 'AuthFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'auth.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      environment: {
        SESSIONS_TABLE: userSessionsTable.tableName,
        JWT_SECRET: 'your-jwt-secret-key', // In production, use AWS Secrets Manager
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'ZeroTrustApi', {
      restApiName: 'Zero Trust Share API',
      description: 'API for Zero Trust File Sharing',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key'],
      },
    });

    // API Gateway integrations
    const uploadIntegration = new apigateway.LambdaIntegration(uploadLambda);
    const downloadIntegration = new apigateway.LambdaIntegration(downloadLambda);
    const metadataIntegration = new apigateway.LambdaIntegration(metadataLambda);
    const deleteIntegration = new apigateway.LambdaIntegration(deleteLambda);
    const authIntegration = new apigateway.LambdaIntegration(authLambda);

    // API Gateway routes
    const uploadResource = api.root.addResource('upload');
    uploadResource.addMethod('POST', uploadIntegration);

    const authResource = api.root.addResource('auth');
    authResource.addMethod('POST', authIntegration);
    authResource.addMethod('GET', authIntegration);

    const fileResource = api.root.addResource('file');
    const fileIdResource = fileResource.addResource('{fileId}');
    
    fileIdResource.addMethod('GET', downloadIntegration);
    fileIdResource.addMethod('DELETE', deleteIntegration);
    
    const metadataResource = fileIdResource.addResource('metadata');
    metadataResource.addMethod('GET', metadataIntegration);

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'ZeroTrustDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(fileBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.RestApiOrigin(api),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      enableLogging: true,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront Distribution URL',
    });

    new cdk.CfnOutput(this, 'FileBucketName', {
      value: fileBucket.bucketName,
      description: 'S3 File Bucket Name',
    });

    new cdk.CfnOutput(this, 'MetadataBucketName', {
      value: metadataBucket.bucketName,
      description: 'S3 Metadata Bucket Name',
    });

    new cdk.CfnOutput(this, 'FileMetadataTableName', {
      value: fileMetadataTable.tableName,
      description: 'DynamoDB File Metadata Table Name',
    });

    new cdk.CfnOutput(this, 'UserSessionsTableName', {
      value: userSessionsTable.tableName,
      description: 'DynamoDB User Sessions Table Name',
    });
  }
}

import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { ZeroTrustShareStack } from '../infrastructure';

describe('ZeroTrustShareStack', () => {
  let app: cdk.App;
  let stack: ZeroTrustShareStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new ZeroTrustShareStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  test('creates S3 buckets with correct configuration', () => {
    // Check file bucket
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256',
            },
          },
        ],
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      VersioningConfiguration: {
        Status: 'Enabled',
      },
    });

    // Check metadata bucket
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256',
            },
          },
        ],
      },
    });
  });

  test('creates DynamoDB tables with correct configuration', () => {
    // Check file metadata table
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'ZeroTrustFileMetadata',
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
        {
          AttributeName: 'fileId',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'createdAt',
          KeyType: 'RANGE',
        },
      ],
      TimeToLiveSpecification: {
        AttributeName: 'ttl',
        Enabled: true,
      },
    });

    // Check user sessions table
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'ZeroTrustUserSessions',
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
        {
          AttributeName: 'sessionId',
          KeyType: 'HASH',
        },
      ],
      TimeToLiveSpecification: {
        AttributeName: 'ttl',
        Enabled: true,
      },
    });
  });

  test('creates Lambda functions with correct configuration', () => {
    const lambdaFunctions = [
      'UploadFunction',
      'DownloadFunction',
      'MetadataFunction',
      'DeleteFunction',
      'AuthFunction',
    ];

    lambdaFunctions.forEach(functionName => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs18.x',
        Timeout: 30,
        Environment: {
          Variables: {
            FILE_BUCKET: {
              Ref: expect.stringMatching(/ZeroTrustFileBucket/),
            },
            METADATA_BUCKET: {
              Ref: expect.stringMatching(/ZeroTrustMetadataBucket/),
            },
            METADATA_TABLE: 'ZeroTrustFileMetadata',
            SESSIONS_TABLE: 'ZeroTrustUserSessions',
          },
        },
      });
    });
  });

  test('creates API Gateway with correct configuration', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'Zero Trust Share API',
      Description: 'API for Zero Trust File Sharing',
    });

    // Check CORS configuration
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
      Integration: {
        Type: 'MOCK',
        IntegrationResponses: [
          {
            StatusCode: '200',
            ResponseParameters: {
              'method.response.header.Access-Control-Allow-Headers': "'Content-Type,Authorization,X-Amz-Date,X-Api-Key'",
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
        ],
      },
    });
  });

  test('creates CloudFront distribution', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        DefaultCacheBehavior: {
          ViewerProtocolPolicy: 'redirect-to-https',
          AllowedMethods: ['GET', 'HEAD', 'OPTIONS'],
          CachedMethods: ['GET', 'HEAD', 'OPTIONS'],
          Compress: true,
        },
        PriceClass: 'PriceClass_100',
        Enabled: true,
        HttpVersion: 'http2',
      },
    });
  });

  test('creates IAM roles with least privilege', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: 'lambda.amazonaws.com',
            },
            Action: 'sts:AssumeRole',
          },
        ],
      },
    });

    // Check that Lambda role has minimal permissions
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: expect.arrayContaining([
          expect.objectContaining({
            Effect: 'Allow',
            Action: [
              's3:GetObject',
              's3:PutObject',
              's3:DeleteObject',
              's3:GetObjectVersion',
              's3:DeleteObjectVersion',
            ],
            Resource: expect.arrayContaining([
              expect.stringMatching(/arn:aws:s3:::zero-trust-files-.*\/\*/),
              expect.stringMatching(/arn:aws:s3:::zero-trust-metadata-.*\/\*/),
            ]),
          }),
        ]),
      },
    });
  });

  test('creates CloudWatch log groups', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      RetentionInDays: 7,
    });
  });

  test('outputs are created correctly', () => {
    template.hasOutput('ApiUrl', {
      Description: 'API Gateway URL',
    });

    template.hasOutput('CloudFrontUrl', {
      Description: 'CloudFront Distribution URL',
    });

    template.hasOutput('FileBucketName', {
      Description: 'S3 File Bucket Name',
    });

    template.hasOutput('MetadataBucketName', {
      Description: 'S3 Metadata Bucket Name',
    });

    template.hasOutput('FileMetadataTableName', {
      Description: 'DynamoDB File Metadata Table Name',
    });

    template.hasOutput('UserSessionsTableName', {
      Description: 'DynamoDB User Sessions Table Name',
    });
  });

  test('S3 lifecycle rules are configured', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      LifecycleConfiguration: {
        Rules: [
          {
            Id: 'DeleteIncompleteMultipartUploads',
            Status: 'Enabled',
            AbortIncompleteMultipartUpload: {
              DaysAfterInitiation: 1,
            },
          },
          {
            Id: 'DeleteExpiredFiles',
            Status: 'Enabled',
            ExpirationInDays: 30,
            ExpiredObjectDeleteMarker: true,
          },
        ],
      },
    });
  });

  test('DynamoDB tables have encryption enabled', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      SSESpecification: {
        SSEEnabled: true,
      },
    });
  });
});

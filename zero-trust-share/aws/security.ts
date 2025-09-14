import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class SecurityStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create secrets for sensitive data
    this.createSecrets();

    // Create WAF for API protection
    this.createWAF();

    // Create security policies
    this.createSecurityPolicies();

    // Create audit logging
    this.createAuditLogging();
  }

  private createSecrets(): void {
    // JWT Secret
    new secretsmanager.Secret(this, 'JWTSecret', {
      secretName: 'zero-trust-share/jwt-secret',
      description: 'JWT secret for Zero Trust Share authentication',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'jwt-secret',
        passwordLength: 64,
        excludeCharacters: '"@/\\',
      },
    });

    // Database encryption key
    new secretsmanager.Secret(this, 'DatabaseEncryptionKey', {
      secretName: 'zero-trust-share/database-encryption-key',
      description: 'Database encryption key for Zero Trust Share',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'encryption-key',
        passwordLength: 32,
        excludeCharacters: '"@/\\',
      },
    });
  }

  private createWAF(): wafv2.CfnWebACL {
    // Create WAF rules
    const wafRules: wafv2.CfnWebACL.RuleProperty[] = [
      // Rate limiting rule
      {
        name: 'RateLimitRule',
        priority: 1,
        statement: {
          rateBasedStatement: {
            limit: 2000, // 2000 requests per 5 minutes
            aggregateKeyType: 'IP',
          },
        },
        action: {
          block: {},
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: 'RateLimitRule',
        },
      },
      // SQL injection protection
      {
        name: 'SQLInjectionRule',
        priority: 2,
        statement: {
          sqliMatchStatement: {
            fieldToMatch: {
              body: {},
            },
            textTransformations: [
              {
                priority: 0,
                type: 'URL_DECODE',
              },
              {
                priority: 1,
                type: 'HTML_ENTITY_DECODE',
              },
            ],
          },
        },
        action: {
          block: {},
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: 'SQLInjectionRule',
        },
      },
      // XSS protection
      {
        name: 'XSSRule',
        priority: 3,
        statement: {
          xssMatchStatement: {
            fieldToMatch: {
              body: {},
            },
            textTransformations: [
              {
                priority: 0,
                type: 'URL_DECODE',
              },
              {
                priority: 1,
                type: 'HTML_ENTITY_DECODE',
              },
            ],
          },
        },
        action: {
          block: {},
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: 'XSSRule',
        },
      },
      // AWS managed rules
      {
        name: 'AWSManagedRulesCommonRuleSet',
        priority: 4,
        statement: {
          managedRuleGroupStatement: {
            vendorName: 'AWS',
            name: 'AWSManagedRulesCommonRuleSet',
          },
        },
        overrideAction: {
          none: {},
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: 'AWSManagedRulesCommonRuleSet',
        },
      },
      {
        name: 'AWSManagedRulesKnownBadInputsRuleSet',
        priority: 5,
        statement: {
          managedRuleGroupStatement: {
            vendorName: 'AWS',
            name: 'AWSManagedRulesKnownBadInputsRuleSet',
          },
        },
        overrideAction: {
          none: {},
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: 'AWSManagedRulesKnownBadInputsRuleSet',
        },
      },
    ];

    // Create WAF Web ACL
    const webACL = new wafv2.CfnWebACL(this, 'ZeroTrustWAF', {
      name: 'ZeroTrustShareWAF',
      description: 'WAF for Zero Trust Share API protection',
      scope: 'REGIONAL',
      defaultAction: {
        allow: {},
      },
      rules: wafRules,
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'ZeroTrustShareWAF',
      },
    });

    return webACL;
  }

  private createSecurityPolicies(): void {
    // Create least privilege IAM policies
    const lambdaExecutionPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
          ],
          resources: ['arn:aws:logs:*:*:*'],
        }),
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
            'arn:aws:s3:::zero-trust-files-*/*',
            'arn:aws:s3:::zero-trust-metadata-*/*',
          ],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['s3:ListBucket'],
          resources: [
            'arn:aws:s3:::zero-trust-files-*',
            'arn:aws:s3:::zero-trust-metadata-*',
          ],
        }),
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
            'arn:aws:dynamodb:*:*:table/ZeroTrustFileMetadata',
            'arn:aws:dynamodb:*:*:table/ZeroTrustUserSessions',
          ],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'secretsmanager:GetSecretValue',
          ],
          resources: [
            'arn:aws:secretsmanager:*:*:secret:zero-trust-share/*',
          ],
        }),
      ],
    });

    // Create IAM role for Lambda functions
    const lambdaRole = new iam.Role(this, 'SecureLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        ZeroTrustPolicy: lambdaExecutionPolicy,
      },
    });

    // Create S3 bucket policy for secure access
    const s3BucketPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.DENY,
          principals: [new iam.AnyPrincipal()],
          actions: ['s3:*'],
          resources: ['arn:aws:s3:::zero-trust-files-*/*'],
          conditions: {
            Bool: {
              'aws:SecureTransport': 'false',
            },
          },
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.DENY,
          principals: [new iam.AnyPrincipal()],
          actions: ['s3:*'],
          resources: ['arn:aws:s3:::zero-trust-metadata-*/*'],
          conditions: {
            Bool: {
              'aws:SecureTransport': 'false',
            },
          },
        }),
      ],
    });

    // Create DynamoDB encryption policy
    const dynamoDBEncryptionPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'kms:Decrypt',
            'kms:GenerateDataKey',
            'kms:DescribeKey',
          ],
          resources: ['*'],
        }),
      ],
    });
  }

  private createAuditLogging(): void {
    // Create CloudTrail for API auditing
    const cloudTrail = new cdk.aws_cloudtrail.Trail(this, 'ZeroTrustCloudTrail', {
      trailName: 'ZeroTrustShareCloudTrail',
      enableLogFileValidation: true,
      includeGlobalServiceEvents: true,
      isMultiRegionTrail: true,
      managementEvents: cdk.aws_cloudtrail.ReadWriteType.ALL,
      insightTypes: [
        cdk.aws_cloudtrail.InsightType.API_CALL_RATE,
        cdk.aws_cloudtrail.InsightType.API_ERROR_RATE,
      ],
    });

    // Create S3 bucket for CloudTrail logs
    const cloudTrailBucket = new s3.Bucket(this, 'CloudTrailLogs', {
      bucketName: `zero-trust-cloudtrail-logs-${this.account}-${this.region}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: 'DeleteOldLogs',
          expiration: cdk.Duration.days(90),
        },
      ],
    });

    // Grant CloudTrail access to the bucket
    cloudTrailBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudtrail.amazonaws.com')],
        actions: ['s3:GetBucketAcl'],
        resources: [cloudTrailBucket.bucketArn],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudtrail:${this.region}:${this.account}:trail/ZeroTrustShareCloudTrail`,
          },
        },
      })
    );

    cloudTrailBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudtrail.amazonaws.com')],
        actions: ['s3:PutObject'],
        resources: [`${cloudTrailBucket.bucketArn}/*`],
        conditions: {
          StringEquals: {
            's3:x-amz-acl': 'bucket-owner-full-control',
            'AWS:SourceArn': `arn:aws:cloudtrail:${this.region}:${this.account}:trail/ZeroTrustShareCloudTrail`,
          },
        },
      })
    );
  }
}

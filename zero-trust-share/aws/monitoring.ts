import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class MonitoringStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SNS Topic for alerts
    const alertTopic = new sns.Topic(this, 'ZeroTrustAlerts', {
      topicName: 'zero-trust-share-alerts',
      displayName: 'Zero Trust Share Alerts',
    });

    // CloudWatch Dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'ZeroTrustDashboard', {
      dashboardName: 'ZeroTrustShare-Dashboard',
    });

    // Lambda Function Alarms
    this.createLambdaAlarms(alertTopic);
    
    // API Gateway Alarms
    this.createApiGatewayAlarms(alertTopic);
    
    // S3 Alarms
    this.createS3Alarms(alertTopic);
    
    // DynamoDB Alarms
    this.createDynamoDBAlarms(alertTopic);

    // Create dashboard widgets
    this.createDashboardWidgets(dashboard);
  }

  private createLambdaAlarms(alertTopic: sns.Topic): void {
    // Error rate alarm
    const errorRateAlarm = new cloudwatch.Alarm(this, 'LambdaErrorRate', {
      alarmName: 'ZeroTrust-Lambda-ErrorRate',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Lambda',
        metricName: 'Errors',
        dimensionsMap: {
          FunctionName: 'ZeroTrustShareStack-UploadFunction',
        },
        statistic: 'Sum',
      }),
      threshold: 5,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    errorRateAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alertTopic));

    // Duration alarm
    const durationAlarm = new cloudwatch.Alarm(this, 'LambdaDuration', {
      alarmName: 'ZeroTrust-Lambda-Duration',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Lambda',
        metricName: 'Duration',
        dimensionsMap: {
          FunctionName: 'ZeroTrustShareStack-UploadFunction',
        },
        statistic: 'Average',
      }),
      threshold: 10000, // 10 seconds
      evaluationPeriods: 2,
    });

    durationAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alertTopic));

    // Throttles alarm
    const throttlesAlarm = new cloudwatch.Alarm(this, 'LambdaThrottles', {
      alarmName: 'ZeroTrust-Lambda-Throttles',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Lambda',
        metricName: 'Throttles',
        dimensionsMap: {
          FunctionName: 'ZeroTrustShareStack-UploadFunction',
        },
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
    });

    throttlesAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alertTopic));
  }

  private createApiGatewayAlarms(alertTopic: sns.Topic): void {
    // 4XX errors alarm
    const clientErrorsAlarm = new cloudwatch.Alarm(this, 'ApiGateway4XXErrors', {
      alarmName: 'ZeroTrust-API-4XXErrors',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApiGateway',
        metricName: '4XXError',
        dimensionsMap: {
          ApiName: 'Zero Trust Share API',
        },
        statistic: 'Sum',
      }),
      threshold: 10,
      evaluationPeriods: 2,
    });

    clientErrorsAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alertTopic));

    // 5XX errors alarm
    const serverErrorsAlarm = new cloudwatch.Alarm(this, 'ApiGateway5XXErrors', {
      alarmName: 'ZeroTrust-API-5XXErrors',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApiGateway',
        metricName: '5XXError',
        dimensionsMap: {
          ApiName: 'Zero Trust Share API',
        },
        statistic: 'Sum',
      }),
      threshold: 5,
      evaluationPeriods: 1,
    });

    serverErrorsAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alertTopic));

    // Latency alarm
    const latencyAlarm = new cloudwatch.Alarm(this, 'ApiGatewayLatency', {
      alarmName: 'ZeroTrust-API-Latency',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApiGateway',
        metricName: 'Latency',
        dimensionsMap: {
          ApiName: 'Zero Trust Share API',
        },
        statistic: 'Average',
      }),
      threshold: 2000, // 2 seconds
      evaluationPeriods: 2,
    });

    latencyAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alertTopic));
  }

  private createS3Alarms(alertTopic: sns.Topic): void {
    // S3 request errors alarm
    const s3ErrorsAlarm = new cloudwatch.Alarm(this, 'S3RequestErrors', {
      alarmName: 'ZeroTrust-S3-RequestErrors',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/S3',
        metricName: '4xxErrors',
        dimensionsMap: {
          BucketName: 'zero-trust-files',
        },
        statistic: 'Sum',
      }),
      threshold: 5,
      evaluationPeriods: 2,
    });

    s3ErrorsAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alertTopic));
  }

  private createDynamoDBAlarms(alertTopic: sns.Topic): void {
    // DynamoDB throttled requests alarm
    const throttledRequestsAlarm = new cloudwatch.Alarm(this, 'DynamoDBThrottledRequests', {
      alarmName: 'ZeroTrust-DynamoDB-ThrottledRequests',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/DynamoDB',
        metricName: 'ThrottledRequests',
        dimensionsMap: {
          TableName: 'ZeroTrustFileMetadata',
        },
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
    });

    throttledRequestsAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alertTopic));

    // DynamoDB user errors alarm
    const userErrorsAlarm = new cloudwatch.Alarm(this, 'DynamoDBUserErrors', {
      alarmName: 'ZeroTrust-DynamoDB-UserErrors',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/DynamoDB',
        metricName: 'UserErrors',
        dimensionsMap: {
          TableName: 'ZeroTrustFileMetadata',
        },
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
    });

    userErrorsAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alertTopic));
  }

  private createDashboardWidgets(dashboard: cloudwatch.Dashboard): void {
    // Lambda metrics widget
    const lambdaWidget = new cloudwatch.GraphWidget({
      title: 'Lambda Functions',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Invocations',
          dimensionsMap: {
            FunctionName: 'ZeroTrustShareStack-UploadFunction',
          },
          statistic: 'Sum',
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Errors',
          dimensionsMap: {
            FunctionName: 'ZeroTrustShareStack-UploadFunction',
          },
          statistic: 'Sum',
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Duration',
          dimensionsMap: {
            FunctionName: 'ZeroTrustShareStack-UploadFunction',
          },
          statistic: 'Average',
        }),
      ],
      width: 12,
      height: 6,
    });

    // API Gateway metrics widget
    const apiGatewayWidget = new cloudwatch.GraphWidget({
      title: 'API Gateway',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/ApiGateway',
          metricName: 'Count',
          dimensionsMap: {
            ApiName: 'Zero Trust Share API',
          },
          statistic: 'Sum',
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/ApiGateway',
          metricName: '4XXError',
          dimensionsMap: {
            ApiName: 'Zero Trust Share API',
          },
          statistic: 'Sum',
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/ApiGateway',
          metricName: '5XXError',
          dimensionsMap: {
            ApiName: 'Zero Trust Share API',
          },
          statistic: 'Sum',
        }),
      ],
      width: 12,
      height: 6,
    });

    // S3 metrics widget
    const s3Widget = new cloudwatch.GraphWidget({
      title: 'S3 Storage',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/S3',
          metricName: 'BucketSizeBytes',
          dimensionsMap: {
            BucketName: 'zero-trust-files',
          },
          statistic: 'Average',
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/S3',
          metricName: 'NumberOfObjects',
          dimensionsMap: {
            BucketName: 'zero-trust-files',
          },
          statistic: 'Average',
        }),
      ],
      width: 12,
      height: 6,
    });

    // DynamoDB metrics widget
    const dynamoDBWidget = new cloudwatch.GraphWidget({
      title: 'DynamoDB',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'ConsumedReadCapacityUnits',
          dimensionsMap: {
            TableName: 'ZeroTrustFileMetadata',
          },
          statistic: 'Sum',
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'ConsumedWriteCapacityUnits',
          dimensionsMap: {
            TableName: 'ZeroTrustFileMetadata',
          },
          statistic: 'Sum',
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'ThrottledRequests',
          dimensionsMap: {
            TableName: 'ZeroTrustFileMetadata',
          },
          statistic: 'Sum',
        }),
      ],
      width: 12,
      height: 6,
    });

    // Add widgets to dashboard
    dashboard.addWidgets(
      lambdaWidget,
      apiGatewayWidget,
      s3Widget,
      dynamoDBWidget
    );
  }
}

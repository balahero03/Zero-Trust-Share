import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, DeleteItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const s3Client = new S3Client({});
const dynamoClient = new DynamoDBClient({});

const FILE_BUCKET = process.env.FILE_BUCKET!;
const METADATA_TABLE = process.env.METADATA_TABLE!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
      'Content-Type': 'application/json',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    const fileId = event.pathParameters?.fileId;

    if (!fileId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'File ID is required' }),
      };
    }

    // Check if file exists in DynamoDB
    const metadataResult = await dynamoClient.send(new GetItemCommand({
      TableName: METADATA_TABLE,
      Key: {
        fileId: { S: fileId },
        createdAt: { S: 'latest' },
      },
    }));

    if (!metadataResult.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'File not found' }),
      };
    }

    const metadata = unmarshall(metadataResult.Item);

    // Delete from DynamoDB
    await dynamoClient.send(new DeleteItemCommand({
      TableName: METADATA_TABLE,
      Key: {
        fileId: { S: fileId },
        createdAt: { S: 'latest' },
      },
    }));

    // Delete from S3
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: FILE_BUCKET,
        Key: `files/${fileId}`,
      }));
    } catch (error: any) {
      if (error.name !== 'NoSuchKey') {
        console.error('Failed to delete file from S3:', error);
        // Continue even if S3 deletion fails
      }
    }

    // Delete metadata from S3 as well
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: FILE_BUCKET,
        Key: `metadata/${fileId}.json`,
      }));
    } catch (error: any) {
      if (error.name !== 'NoSuchKey') {
        console.error('Failed to delete metadata from S3:', error);
        // Continue even if metadata deletion fails
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'File deleted successfully',
        fileId,
        originalName: metadata.originalName,
      }),
    };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

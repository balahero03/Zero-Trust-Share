import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const dynamoClient = new DynamoDBClient({});
const s3Client = new S3Client({});

const METADATA_TABLE = process.env.METADATA_TABLE!;
const FILE_BUCKET = process.env.FILE_BUCKET!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
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

    // Get metadata from DynamoDB
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
    const now = new Date();
    const expiresAt = new Date(metadata.expiresAt);

    // Check if file has expired
    if (now > expiresAt) {
      // Delete expired file
      await deleteExpiredFile(fileId);
      return {
        statusCode: 410,
        headers,
        body: JSON.stringify({ error: 'File has expired' }),
      };
    }

    // Return metadata without sensitive information
    const publicMetadata = {
      originalName: metadata.originalName,
      originalSize: metadata.originalSize,
      burnAfterRead: metadata.burnAfterRead,
      uploadedAt: metadata.uploadedAt,
      expiresAt: metadata.expiresAt,
      iv: metadata.iv,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(publicMetadata),
    };
  } catch (error) {
    console.error('Metadata error:', error);
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

async function deleteExpiredFile(fileId: string): Promise<void> {
  try {
    // Delete from DynamoDB
    await dynamoClient.send(new DeleteItemCommand({
      TableName: METADATA_TABLE,
      Key: {
        fileId: { S: fileId },
        createdAt: { S: 'latest' },
      },
    }));

    // Delete from S3
    await s3Client.send(new DeleteObjectCommand({
      Bucket: FILE_BUCKET,
      Key: `files/${fileId}`,
    }));
  } catch (error) {
    console.error('Failed to delete expired file:', error);
  }
}

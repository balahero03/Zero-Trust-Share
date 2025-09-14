import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DynamoDBClient, GetItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
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
        createdAt: { S: 'latest' }, // We'll use a sort key for versioning
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
      await deleteFile(fileId);
      return {
        statusCode: 410,
        headers,
        body: JSON.stringify({ error: 'File has expired' }),
      };
    }

    // Check if file exists in S3
    try {
      await s3Client.send(new HeadObjectCommand({
        Bucket: FILE_BUCKET,
        Key: `files/${fileId}`,
      }));
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'File not found' }),
        };
      }
      throw error;
    }

    // Create pre-signed URL for file download
    const getObjectCommand = new GetObjectCommand({
      Bucket: FILE_BUCKET,
      Key: `files/${fileId}`,
    });

    const downloadUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 3600, // 1 hour
    });

    // If burn after read is enabled, delete the file after providing download URL
    if (metadata.burnAfterRead) {
      // Note: In a real implementation, you might want to use SQS or SNS
      // to handle the deletion asynchronously after the download is complete
      setTimeout(async () => {
        try {
          await deleteFile(fileId);
        } catch (error) {
          console.error('Failed to delete file after burn:', error);
        }
      }, 5000); // 5 second delay to allow download to start
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        downloadUrl,
        fileId,
        metadata: {
          originalName: metadata.originalName,
          originalSize: metadata.originalSize,
          burnAfterRead: metadata.burnAfterRead,
          expiresAt: metadata.expiresAt,
        },
      }),
    };
  } catch (error) {
    console.error('Download error:', error);
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

async function deleteFile(fileId: string): Promise<void> {
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
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    await s3Client.send(new DeleteObjectCommand({
      Bucket: FILE_BUCKET,
      Key: `files/${fileId}`,
    }));
  } catch (error) {
    console.error('Failed to delete file:', error);
    throw error;
  }
}

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({});
const dynamoClient = new DynamoDBClient({});

const FILE_BUCKET = process.env.FILE_BUCKET!;
const METADATA_BUCKET = process.env.METADATA_BUCKET!;
const METADATA_TABLE = process.env.METADATA_TABLE!;

interface UploadRequest {
  fileId?: string;
  metadata: {
    originalName: string;
    originalSize: number;
    burnAfterRead: boolean;
    expiryHours: number;
    iv: number[];
    uploadedAt: string;
    expiresAt: string;
  };
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
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

    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const { fileId, metadata }: UploadRequest = JSON.parse(event.body);

    if (!metadata) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Metadata is required' }),
      };
    }

    const generatedFileId = fileId || uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + metadata.expiryHours * 60 * 60 * 1000);

    // Create pre-signed URL for file upload
    const putObjectCommand = new PutObjectCommand({
      Bucket: FILE_BUCKET,
      Key: `files/${generatedFileId}`,
      ContentType: 'application/octet-stream',
      Metadata: {
        'original-name': metadata.originalName,
        'original-size': metadata.originalSize.toString(),
        'burn-after-read': metadata.burnAfterRead.toString(),
        'expires-at': expiresAt.toISOString(),
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600, // 1 hour
    });

    // Store metadata in DynamoDB
    const metadataItem = {
      fileId: generatedFileId,
      createdAt: now.toISOString(),
      originalName: metadata.originalName,
      originalSize: metadata.originalSize,
      burnAfterRead: metadata.burnAfterRead,
      expiryHours: metadata.expiryHours,
      iv: metadata.iv,
      uploadedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      ttl: Math.floor(expiresAt.getTime() / 1000), // TTL for DynamoDB
    };

    await dynamoClient.send(new PutItemCommand({
      TableName: METADATA_TABLE,
      Item: marshall(metadataItem),
    }));

    // Store metadata in S3 as backup
    const metadataCommand = new PutObjectCommand({
      Bucket: METADATA_BUCKET,
      Key: `metadata/${generatedFileId}.json`,
      Body: JSON.stringify(metadataItem),
      ContentType: 'application/json',
    });

    await s3Client.send(metadataCommand);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        uploadUrl,
        fileId: generatedFileId,
        expiresAt: expiresAt.toISOString(),
      }),
    };
  } catch (error) {
    console.error('Upload error:', error);
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

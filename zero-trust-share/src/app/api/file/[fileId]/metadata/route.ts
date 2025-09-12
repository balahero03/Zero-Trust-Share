import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'zero-trust-share';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    const metadataKey = `metadata/${fileId}.json`;

    try {
      // Get metadata from S3
      const getObjectCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: metadataKey,
      });

      const response = await s3Client.send(getObjectCommand);
      
      if (!response.Body) {
        throw new Error('No metadata found');
      }

      const metadataString = await response.Body.transformToString();
      const metadata = JSON.parse(metadataString);

      // Check if file has expired
      const now = new Date();
      const expiresAt = new Date(metadata.expiresAt);
      
      if (now > expiresAt) {
        // File has expired, delete it
        await deleteExpiredFile(fileId);
        return NextResponse.json(
          { error: 'File has expired' },
          { status: 410 }
        );
      }

      return NextResponse.json(metadata);
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Metadata API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function deleteExpiredFile(fileId: string) {
  try {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    
    const deleteMetadataCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `metadata/${fileId}.json`,
    });

    const deleteFileCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `files/${fileId}`,
    });

    await Promise.all([
      s3Client.send(deleteMetadataCommand),
      s3Client.send(deleteFileCommand),
    ]);
  } catch (error) {
    console.error('Failed to delete expired file:', error);
  }
}


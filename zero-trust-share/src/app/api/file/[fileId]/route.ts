import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'zero-trust-share';

export async function DELETE(
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

    // Delete both the file and its metadata
    const deleteFileCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `files/${fileId}`,
    });

    const deleteMetadataCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `metadata/${fileId}.json`,
    });

    try {
      await Promise.all([
        s3Client.send(deleteFileCommand),
        s3Client.send(deleteMetadataCommand),
      ]);

      return NextResponse.json({
        message: 'File deleted successfully',
        fileId,
      });
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
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'zero-trust-share';

export async function POST(request: NextRequest) {
  try {
    const { fileId, metadata } = await request.json();

    if (!fileId || !metadata) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store metadata in a separate object
    const metadataKey = `metadata/${fileId}.json`;
    const fileKey = `files/${fileId}`;

    // Create pre-signed URL for file upload
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: 'application/octet-stream',
      Metadata: {
        'original-name': metadata.originalName,
        'original-size': metadata.originalSize.toString(),
        'burn-after-read': metadata.burnAfterRead.toString(),
        'expires-at': metadata.expiresAt,
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600, // 1 hour
    });

    // Store metadata separately
    const metadataCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: metadataKey,
      Body: JSON.stringify(metadata),
      ContentType: 'application/json',
    });

    await s3Client.send(metadataCommand);

    return NextResponse.json({
      uploadUrl,
      fileId,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


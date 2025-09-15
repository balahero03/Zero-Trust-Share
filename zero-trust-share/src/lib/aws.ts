/**
 * AWS S3 configuration for AetherVault
 * Handles secure file storage operations
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

/**
 * Generate a pre-signed URL for uploading a file to S3
 */
export async function generateUploadUrl(
  key: string,
  expiresIn: number = 300 // 5 minutes
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: 'application/octet-stream',
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Generate a pre-signed URL for downloading a file from S3
 */
export async function generateDownloadUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Delete a file from S3
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
}

/**
 * Check if a file exists in S3
 */
export async function fileExistsInS3(key: string): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    await s3Client.send(command)
    return true
  } catch (error) {
    return false
  }
}

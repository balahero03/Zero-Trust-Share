/**
 * Storage utilities for encrypted file upload and download
 * Handles AWS S3 integration with pre-signed URLs
 */

import { generateFileId } from './encryption';

export interface FileMetadata {
  originalName: string;
  originalSize: number;
  burnAfterRead: boolean;
  expiryHours: number;
  iv: number[];
  salt: number[];
  uploadedAt: string;
  expiresAt: string;
}

/**
 * Upload encrypted file to storage
 */
export async function uploadFile(
  encryptedData: ArrayBuffer,
  metadata: Omit<FileMetadata, 'uploadedAt' | 'expiresAt'>
): Promise<string> {
  try {
    const fileId = generateFileId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + metadata.expiryHours * 60 * 60 * 1000);

    const fullMetadata: FileMetadata = {
      ...metadata,
      uploadedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    // Get pre-signed upload URL from backend
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId,
        metadata: fullMetadata
      })
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl } = await uploadResponse.json();

    // Upload encrypted data directly to S3
    const uploadResult = await fetch(uploadUrl, {
      method: 'PUT',
      body: encryptedData,
      headers: {
        'Content-Type': 'application/octet-stream',
      }
    });

    if (!uploadResult.ok) {
      throw new Error('Failed to upload file');
    }

    return fileId;
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error('Failed to upload file. Please try again.');
  }
}

/**
 * Download encrypted file from storage
 */
export async function downloadFile(fileId: string): Promise<ArrayBuffer> {
  try {
    // Get pre-signed download URL from backend
    const downloadResponse = await fetch(`/api/file/${fileId}/download`);

    if (!downloadResponse.ok) {
      if (downloadResponse.status === 404) {
        throw new Error('File not found or expired');
      }
      throw new Error('Failed to get download URL');
    }

    const { downloadUrl } = await downloadResponse.json();

    // Download encrypted data directly from S3
    const fileResponse = await fetch(downloadUrl);

    if (!fileResponse.ok) {
      throw new Error('Failed to download file');
    }

    return await fileResponse.arrayBuffer();
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string): Promise<FileMetadata> {
  try {
    const response = await fetch(`/api/file/${fileId}/metadata`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('File not found or expired');
      }
      throw new Error('Failed to get file metadata');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get metadata:', error);
    throw error;
  }
}

/**
 * Delete file (for burn after read)
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    const response = await fetch(`/api/file/${fileId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  } catch (error) {
    console.error('Failed to delete file:', error);
    throw error;
  }
}

/**
 * Check if file exists and is not expired
 */
export async function validateFile(fileId: string): Promise<boolean> {
  try {
    const metadata = await getFileMetadata(fileId);
    const now = new Date();
    const expiresAt = new Date(metadata.expiresAt);
    
    return now < expiresAt;
  } catch (error) {
    return false;
  }
}


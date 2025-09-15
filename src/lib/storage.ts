/**
 * AetherVault Storage Utilities
 * Handles zero-knowledge file upload and download with Supabase + AWS S3
 */

import { supabase } from './supabase';

export interface FileMetadata {
  originalName: string;
  originalSize: number;
  burnAfterRead: boolean;
  expiryHours: number;
  iv: number[];
  uploadedAt: string;
  expiresAt: string;
}

export interface UploadResponse {
  fileId: string;
  uploadUrl: string;
  s3Key: string;
}

/**
 * Prepare file upload by getting pre-signed URL and creating database record
 */
export async function prepareFileUpload(
  encryptedFileName: string,
  fileSize: number,
  fileSalt: Uint8Array,
  burnAfterRead: boolean = false,
  expiryHours: number = 24
): Promise<UploadResponse> {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Get pre-signed upload URL from backend
    const uploadResponse = await fetch('/api/prepare-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        encryptedFileName,
        fileSize,
        fileSalt: Array.from(fileSalt),
        burnAfterRead,
        expiryHours
      })
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.error || 'Failed to prepare upload');
    }

    return await uploadResponse.json();
  } catch (error) {
    console.error('Prepare upload failed:', error);
    throw new Error('Failed to prepare upload. Please try again.');
  }
}

/**
 * Upload encrypted file data to S3 using pre-signed URL
 */
export async function uploadFileData(
  uploadUrl: string,
  encryptedData: ArrayBuffer
): Promise<void> {
  try {
    const uploadResult = await fetch(uploadUrl, {
      method: 'PUT',
      body: encryptedData,
      headers: {
        'Content-Type': 'application/octet-stream',
      }
    });

    if (!uploadResult.ok) {
      throw new Error('Failed to upload file data');
    }
  } catch (error) {
    console.error('Upload data failed:', error);
    throw new Error('Failed to upload file data. Please try again.');
  }
}

/**
 * Get file metadata for download
 */
export async function getFileMetadata(fileId: string): Promise<{
  fileSize: number;
  fileSalt: Uint8Array;
  burnAfterRead: boolean;
  downloadCount: number;
}> {
  try {
    const response = await fetch(`/api/get-file-metadata/${fileId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('File not found');
      } else if (response.status === 410) {
        throw new Error('File has expired or been consumed');
      }
      throw new Error('Failed to get file metadata');
    }

    const data = await response.json();
    return {
      fileSize: data.fileSize,
      fileSalt: new Uint8Array(data.fileSalt),
      burnAfterRead: data.burnAfterRead,
      downloadCount: data.downloadCount
    };
  } catch (error) {
    console.error('Failed to get metadata:', error);
    throw error;
  }
}

/**
 * Download encrypted file from storage
 */
export async function downloadFile(fileId: string): Promise<ArrayBuffer> {
  try {
    // Get pre-signed download URL from backend
    const downloadResponse = await fetch(`/api/get-file-download/${fileId}`);

    if (!downloadResponse.ok) {
      if (downloadResponse.status === 404) {
        throw new Error('File not found');
      } else if (downloadResponse.status === 410) {
        throw new Error('File has expired or been consumed');
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
 * Record successful download
 */
export async function recordDownload(fileId: string): Promise<{
  success: boolean;
  downloadCount: number;
  burned: boolean;
}> {
  try {
    const response = await fetch('/api/record-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId })
    });

    if (!response.ok) {
      throw new Error('Failed to record download');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to record download:', error);
    throw error;
  }
}

/**
 * Get user's files for dashboard
 */
export async function getUserFiles(): Promise<Array<{
  id: string;
  encrypted_file_name: string;
  file_size: number;
  expires_at: string | null;
  burn_after_read: boolean;
  download_count: number;
  created_at: string;
}>> {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/my-files', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user files');
    }

    const data = await response.json();
    return data.files;
  } catch (error) {
    console.error('Failed to get user files:', error);
    throw error;
  }
}

/**
 * Revoke file access
 */
export async function revokeFile(fileId: string): Promise<void> {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/revoke-file', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ fileId })
    });

    if (!response.ok) {
      throw new Error('Failed to revoke file');
    }
  } catch (error) {
    console.error('Failed to revoke file:', error);
    throw error;
  }
}


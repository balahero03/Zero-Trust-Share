/**
 * Azure Blob Storage configuration for AetherVault
 * Handles secure file storage operations using Azure Blob Storage
 */

import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob'

require('dotenv').config({ path: '.env.local' });

// Initialize Azure Blob Storage client
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!

// Create shared key credential
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)

// Create blob service client
export const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
)

// Get container client
export const containerClient = blobServiceClient.getContainerClient(containerName)

/**
 * Generate a pre-signed URL for uploading a file to Azure Blob Storage
 */
export async function generateUploadUrl(
  blobName: string,
  expiresIn: number = 300 // 5 minutes
): Promise<string> {
  try {
    // Get blob client
    const blobClient = containerClient.getBlockBlobClient(blobName)
    
    // Generate SAS token for upload
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('w'), // write permission
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + expiresIn * 1000),
      },
      sharedKeyCredential
    ).toString()

    return `${blobClient.url}?${sasToken}`
  } catch (error) {
    console.error('Error generating upload URL:', error)
    throw new Error('Failed to generate upload URL')
  }
}

/**
 * Generate a pre-signed URL for downloading a file from Azure Blob Storage
 */
export async function generateDownloadUrl(
  blobName: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  try {
    // Get blob client
    const blobClient = containerClient.getBlockBlobClient(blobName)
    
    // Generate SAS token for download
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'), // read permission
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + expiresIn * 1000),
      },
      sharedKeyCredential
    ).toString()

    return `${blobClient.url}?${sasToken}`
  } catch (error) {
    console.error('Error generating download URL:', error)
    throw new Error('Failed to generate download URL')
  }
}

/**
 * Delete a file from Azure Blob Storage
 */
export async function deleteFileFromBlob(blobName: string): Promise<void> {
  try {
    const blobClient = containerClient.getBlockBlobClient(blobName)
    await blobClient.delete()
  } catch (error) {
    console.error('Error deleting blob:', error)
    throw new Error('Failed to delete file from storage')
  }
}

/**
 * Check if a file exists in Azure Blob Storage
 */
export async function fileExistsInBlob(blobName: string): Promise<boolean> {
  try {
    const blobClient = containerClient.getBlockBlobClient(blobName)
    const exists = await blobClient.exists()
    return exists
  } catch (error) {
    console.error('Error checking blob existence:', error)
    return false
  }
}

/**
 * Get blob properties (size, last modified, etc.)
 */
export async function getBlobProperties(blobName: string): Promise<{
  contentLength: number
  lastModified: Date
  etag: string
} | null> {
  try {
    const blobClient = containerClient.getBlockBlobClient(blobName)
    const properties = await blobClient.getProperties()
    
    return {
      contentLength: properties.contentLength || 0,
      lastModified: properties.lastModified || new Date(),
      etag: properties.etag || ''
    }
  } catch (error) {
    console.error('Error getting blob properties:', error)
    return null
  }
}

/**
 * List blobs in a specific prefix (user folder)
 */
export async function listUserBlobs(userId: string): Promise<string[]> {
  try {
    const blobs: string[] = []
    const prefix = `${userId}/`
    
    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
      blobs.push(blob.name)
    }
    
    return blobs
  } catch (error) {
    console.error('Error listing user blobs:', error)
    return []
  }
}

/**
 * Create container if it doesn't exist
 */
export async function ensureContainerExists(): Promise<void> {
  try {
    await containerClient.createIfNotExists({
      access: 'private' // Private access by default
    })
  } catch (error) {
    console.error('Error creating container:', error)
    throw new Error('Failed to create storage container')
  }
}

/**
 * Client-side encryption utilities using Web Crypto API
 * Implements AES-256-GCM with direct key generation
 */

// Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return btoa(String.fromCharCode(...bytes));
}

// Convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate a random IV (96-bit for AES-GCM)
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

// Import key from raw bytes
async function importKeyFromRaw(rawKey: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a file using AES-256-GCM with direct key generation
 */
export async function encryptFile(
  file: File
): Promise<{
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  key: string; // Base64 encoded key
}> {
  try {
    // Generate AES-256-GCM key
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    // Generate fresh random IV (96-bit for AES-GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // Encrypt the file
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      fileBuffer
    );

    // Export key as raw bytes and convert to Base64
    const rawKey = await crypto.subtle.exportKey("raw", key);
    const base64Key = btoa(String.fromCharCode(...new Uint8Array(rawKey)));

    return {
      encryptedData,
      iv,
      key: base64Key
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt file. Please try again.');
  }
}

/**
 * Decrypt a file using AES-256-GCM with direct key import
 */
export async function decryptFile(
  encryptedData: ArrayBuffer,
  base64Key: string,
  iv: Uint8Array
): Promise<Blob> {
  try {
    // Convert Base64 key back to ArrayBuffer
    const rawKey = base64ToArrayBuffer(base64Key);
    
    // Import the key
    const key = await importKeyFromRaw(rawKey);

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedData
    );

    // Return as Blob
    return new Blob([decryptedData]);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt file. Please check your key.');
  }
}

/**
 * Generate a secure random file ID
 */
export function generateFileId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

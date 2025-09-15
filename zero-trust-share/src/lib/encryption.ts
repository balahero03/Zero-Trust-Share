/**
 * AetherVault Zero-Knowledge Encryption Utilities
 * Implements full-stack zero-knowledge architecture with PBKDF2 key derivation
 * The server never sees unencrypted data, user passcodes, or master passwords
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

// Generate a random salt for PBKDF2
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

// Generate a random IV (96-bit for AES-GCM)
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Derive a master key from user password using PBKDF2
 * This is the foundation of our zero-knowledge architecture
 */
export async function deriveMasterKey(password: string, salt?: Uint8Array): Promise<{
  masterKey: CryptoKey;
  salt: Uint8Array;
}> {
  const keySalt = salt || generateSalt();
  
  // Import password as key material
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive master key using PBKDF2
  const masterKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: keySalt,
      iterations: 100000, // OWASP recommended minimum
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return { masterKey, salt: keySalt };
}

/**
 * Derive a file key from file passcode using PBKDF2
 */
export async function deriveFileKey(passcode: string, salt: Uint8Array): Promise<CryptoKey> {
  // Import passcode as key material
  const passcodeKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passcode),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive file key using PBKDF2
  const fileKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passcodeKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return fileKey;
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
 * Encrypt a file using AES-256-GCM with PBKDF2-derived file key
 * This implements the zero-knowledge file encryption
 */
export async function encryptFile(
  file: File,
  filePasscode: string
): Promise<{
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  fileSalt: Uint8Array;
}> {
  try {
    // Generate random salt for file key derivation
    const fileSalt = generateSalt();
    
    // Derive file key from passcode
    const fileKey = await deriveFileKey(filePasscode, fileSalt);

    // Generate fresh random IV (96-bit for AES-GCM)
    const iv = generateIV();

    // Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // Encrypt the file
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      fileKey,
      fileBuffer
    );

    return {
      encryptedData,
      iv,
      fileSalt
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt file. Please try again.');
  }
}

/**
 * Decrypt a file using AES-256-GCM with PBKDF2-derived file key
 * This implements the zero-knowledge file decryption
 */
export async function decryptFile(
  encryptedData: ArrayBuffer,
  filePasscode: string,
  fileSalt: Uint8Array,
  iv: Uint8Array
): Promise<Blob> {
  try {
    // Derive file key from passcode and salt
    const fileKey = await deriveFileKey(filePasscode, fileSalt);

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      fileKey,
      encryptedData
    );

    // Return as Blob
    return new Blob([decryptedData]);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt file. Please check your passcode.');
  }
}

/**
 * Encrypt file metadata (filename) using master key
 * This ensures even file names are protected in our zero-knowledge architecture
 */
export async function encryptMetadata(
  data: string,
  masterKey: CryptoKey
): Promise<{
  encryptedData: string;
  iv: Uint8Array;
}> {
  try {
    // Generate fresh random IV
    const iv = generateIV();
    
    // Convert string to ArrayBuffer
    const dataBuffer = new TextEncoder().encode(data);

    // Encrypt the metadata
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      masterKey,
      dataBuffer
    );

    return {
      encryptedData: arrayBufferToBase64(encryptedData),
      iv
    };
  } catch (error) {
    console.error('Metadata encryption failed:', error);
    throw new Error('Failed to encrypt metadata.');
  }
}

/**
 * Decrypt file metadata using master key
 */
export async function decryptMetadata(
  encryptedData: string,
  masterKey: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  try {
    // Convert base64 to ArrayBuffer
    const dataBuffer = base64ToArrayBuffer(encryptedData);

    // Decrypt the metadata
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      masterKey,
      dataBuffer
    );

    // Convert back to string
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Metadata decryption failed:', error);
    throw new Error('Failed to decrypt metadata.');
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

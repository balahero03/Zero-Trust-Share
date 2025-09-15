/**
 * Authentication utilities for Zero-Trust-Share
 * Handles master key initialization and session management
 */

import { deriveMasterKey } from './encryption';

/**
 * Initialize master key salt for authenticated users
 * This ensures the master key is available for encryption/decryption operations
 */
export async function initializeMasterKey(): Promise<void> {
  try {
    // Check if master key salt already exists
    const existingSalt = sessionStorage.getItem('masterKeySalt');
    if (existingSalt) {
      return; // Already initialized
    }

    // Generate new master key salt
    const { salt } = await deriveMasterKey('demo-password');
    sessionStorage.setItem('masterKeySalt', JSON.stringify(Array.from(salt)));
    
    console.log('Master key initialized for session');
  } catch (error) {
    console.error('Failed to initialize master key:', error);
    throw new Error('Failed to initialize encryption keys');
  }
}

/**
 * Get master key salt from session storage
 * Throws error if not found (session expired)
 */
export function getMasterKeySalt(): Uint8Array {
  const masterKeySalt = sessionStorage.getItem('masterKeySalt');
  if (!masterKeySalt) {
    throw new Error('Session expired. Please log in again.');
  }
  
  return new Uint8Array(JSON.parse(masterKeySalt));
}

/**
 * Clear master key from session storage
 * Used during logout
 */
export function clearMasterKey(): void {
  sessionStorage.removeItem('masterKeySalt');
}

/**
 * Check if master key is initialized
 */
export function isMasterKeyInitialized(): boolean {
  return sessionStorage.getItem('masterKeySalt') !== null;
}

/**
 * Handle authentication errors and clear invalid sessions
 */
export async function handleAuthError(error: any): Promise<void> {
  console.error('Authentication error:', error);
  
  // If it's a refresh token error, clear the session
  if (error?.message?.includes('Invalid Refresh Token') || 
      error?.message?.includes('Refresh Token Not Found')) {
    console.log('Clearing invalid session...');
    
    // Clear master key
    clearMasterKey();
    
    // Clear any stored session data
    localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
    sessionStorage.clear();
    
    // Redirect to login or refresh the page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
}
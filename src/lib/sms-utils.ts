/**
 * 🏆 Award-Winning SMS Utility Functions
 * Perfect integration with Twilio for SMS passcode delivery
 */

import { supabaseAdmin } from './supabase'

// Direct Twilio configuration for production use
const accountSid = 'AC89ace0a2c3a23cbcb6a4df4cc49e6d3c';
const authToken = process.env.TWILIO_AUTH_TOKEN || '[AuthToken]'; // Use env var for security
const messagingServiceSid = 'MGe12f0e3fac12d1c9a317e0a9d7e85fb1';

// Fallback to environment variables for flexible configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || accountSid
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || authToken
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || messagingServiceSid
const SMS_RATE_LIMIT_MINUTES = parseInt(process.env.SMS_RATE_LIMIT_MINUTES || '5')
const MAX_SMS_ATTEMPTS = parseInt(process.env.MAX_SMS_ATTEMPTS || '3')

// Twilio client (lazy loaded)
let twilioClient: any = null

async function getTwilioClient() {
  if (!twilioClient) {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured')
    }
    
    // Dynamic import to avoid issues in client-side
    const twilio = await import('twilio')
    twilioClient = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  }
  return twilioClient
}

/**
 * Generate a secure 6-digit passcode
 */
export function generatePasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Format phone number to international format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // If starts with country code, keep as is
  if (digits.startsWith('1') && digits.length === 11) {
    return `+${digits}`
  }
  
  // If 10 digits, assume US number
  if (digits.length === 10) {
    return `+1${digits}`
  }
  
  // If already has +, just clean it
  if (phone.startsWith('+')) {
    return `+${digits}`
  }
  
  // Default to adding +1 for US
  return `+1${digits}`
}

/**
 * Check SMS rate limiting for a phone number
 */
export async function checkSMSRateLimit(phone: string): Promise<{ allowed: boolean, remainingTime?: number }> {
  try {
    const rateLimitTime = new Date()
    rateLimitTime.setMinutes(rateLimitTime.getMinutes() - SMS_RATE_LIMIT_MINUTES)
    
    const { data, error } = await supabaseAdmin
      .from('sms_verification')
      .select('created_at')
      .eq('recipient_phone', phone)
      .gte('created_at', rateLimitTime.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Rate limit check error:', error)
      return { allowed: true } // Fail open
    }
    
    const recentSMS = data?.length || 0
    if (recentSMS >= MAX_SMS_ATTEMPTS) {
      // Calculate remaining time
      const lastSMS = new Date(data[0].created_at)
      const nextAllowed = new Date(lastSMS.getTime() + (SMS_RATE_LIMIT_MINUTES * 60 * 1000))
      const remainingTime = Math.max(0, nextAllowed.getTime() - Date.now())
      
      return { 
        allowed: false, 
        remainingTime: Math.ceil(remainingTime / 1000 / 60) // in minutes
      }
    }
    
    return { allowed: true }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    return { allowed: true } // Fail open for availability
  }
}

/**
 * Send SMS passcode using Twilio
 */
export async function sendSMSPasscode({
  phone,
  passcode,
  fileName
}: {
  phone: string
  passcode: string
  fileName: string
}): Promise<{ success: boolean, error?: string, messageId?: string }> {
  try {
    const formattedPhone = formatPhoneNumber(phone)
    
    // Use your exact Twilio configuration
    const client = await getTwilioClient()
    
    const messageBody = `🔐 AetherVault Security Code: ${passcode}

Your secure file "${fileName}" is ready for download. 

Enter this code to access your file. Code expires in 15 minutes.

Never share this code with anyone.`
    
    // Your exact message configuration
    const message = await client.messages.create({
      body: messageBody,
      messagingServiceSid: messagingServiceSid, // Your Messaging Service SID
      to: formattedPhone
    })
    
    console.log('📱 SMS sent successfully using your configuration:', message.sid)
    
    return {
      success: true,
      messageId: message.sid
    }
  } catch (error) {
    console.error('❌ SMS sending failed:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS'
    }
  }
}

/**
 * Store SMS verification record in database
 */
export async function storeSMSVerification({
  fileId,
  recipientPhone,
  recipientId,
  passcode
}: {
  fileId: string
  recipientPhone: string
  recipientId: string | null
  passcode: string
}): Promise<{ success: boolean, verificationId?: string, error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sms_verification')
      .insert({
        file_id: fileId,
        recipient_phone: formatPhoneNumber(recipientPhone),
        recipient_id: recipientId,
        passcode
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Database insert error:', error)
      return { success: false, error: error.message }
    }
    
    return { 
      success: true, 
      verificationId: data.id 
    }
  } catch (error) {
    console.error('Store SMS verification error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Database error'
    }
  }
}

/**
 * Verify SMS passcode
 */
export async function verifySMSPasscode({
  fileId,
  phone,
  passcode
}: {
  fileId: string
  phone: string
  passcode: string
}): Promise<{ 
  success: boolean
  expired?: boolean
  maxAttemptsReached?: boolean
  error?: string
  verificationId?: string
}> {
  try {
    const formattedPhone = formatPhoneNumber(phone)
    
    // Get the latest verification record
    const { data: verification, error: fetchError } = await supabaseAdmin
      .from('sms_verification')
      .select('*')
      .eq('file_id', fileId)
      .eq('recipient_phone', formattedPhone)
      .is('verified_at', null) // Only unverified records
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (fetchError || !verification) {
      return { 
        success: false, 
        error: 'No valid verification found' 
      }
    }
    
    // Check if expired
    const now = new Date()
    const expiresAt = new Date(verification.expires_at)
    if (now > expiresAt) {
      return { 
        success: false, 
        expired: true,
        error: 'Passcode has expired' 
      }
    }
    
    // Check max attempts
    if (verification.attempts >= verification.max_attempts) {
      return { 
        success: false, 
        maxAttemptsReached: true,
        error: 'Maximum verification attempts reached' 
      }
    }
    
    // Increment attempts
    const { error: updateError } = await supabaseAdmin
      .from('sms_verification')
      .update({ 
        attempts: verification.attempts + 1,
        verified_at: passcode === verification.passcode ? now.toISOString() : null
      })
      .eq('id', verification.id)
    
    if (updateError) {
      console.error('Update verification error:', updateError)
      return { success: false, error: 'Database update failed' }
    }
    
    // Check if passcode matches
    if (passcode !== verification.passcode) {
      const remainingAttempts = verification.max_attempts - (verification.attempts + 1)
      return { 
        success: false, 
        error: `Invalid passcode. ${remainingAttempts} attempts remaining.` 
      }
    }
    
    return { 
      success: true, 
      verificationId: verification.id 
    }
  } catch (error) {
    console.error('Verify SMS passcode error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Verification failed'
    }
  }
}

/**
 * Clean up expired SMS verification records
 */
export async function cleanupExpiredSMSVerifications(): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('sms_verification')
      .delete()
      .lt('expires_at', new Date().toISOString())
    
    if (error) {
      console.error('Cleanup expired SMS verifications error:', error)
    } else {
      console.log('✅ Cleaned up expired SMS verifications')
    }
  } catch (error) {
    console.error('Cleanup SMS verifications failed:', error)
  }
}

/**
 * Get SMS verification statistics for a file
 */
export async function getSMSVerificationStats(fileId: string): Promise<{
  total: number
  verified: number
  expired: number
  pending: number
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sms_verification')
      .select('verified_at, expires_at')
      .eq('file_id', fileId)
    
    if (error || !data) {
      return { total: 0, verified: 0, expired: 0, pending: 0 }
    }
    
    const now = new Date()
    const stats = {
      total: data.length,
      verified: 0,
      expired: 0,
      pending: 0
    }
    
    data.forEach(record => {
      if (record.verified_at) {
        stats.verified++
      } else if (new Date(record.expires_at) < now) {
        stats.expired++
      } else {
        stats.pending++
      }
    })
    
    return stats
  } catch (error) {
    console.error('Get SMS stats error:', error)
    return { total: 0, verified: 0, expired: 0, pending: 0 }
  }
}

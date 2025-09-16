/**
 * 🏆 Production Twilio Service
 * Uses your exact Twilio configuration for SMS sending
 */

// Your exact Twilio configuration
const accountSid = 'AC89ace0a2c3a23cbcb6a4df4cc49e6d3c';
const authToken = process.env.TWILIO_AUTH_TOKEN || '1cad0095368ab4dc56450149ca7fbbfc';
const messagingServiceSid = 'MGe12f0e3fac12d1c9a317e0a9d7e85fb1';

// Twilio client instance
let twilioClient: any = null;

/**
 * Get initialized Twilio client
 */
async function getTwilioClient() {
  if (!twilioClient) {
    const twilio = await import('twilio');
    twilioClient = twilio.default(accountSid, authToken);
  }
  return twilioClient;
}

/**
 * Send SMS using your exact Twilio configuration
 */
export async function sendSMS({
  to,
  body
}: {
  to: string;
  body: string;
}): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}> {
  try {
    console.log(`📱 Sending SMS to ${to}...`);
    
    const client = await getTwilioClient();
    
    const message = await client.messages.create({
      body,
      messagingServiceSid,
      to
    });
    
    console.log(`✅ SMS sent successfully! SID: ${message.sid}`);
    
    return {
      success: true,
      messageId: message.sid,
      details: {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.messagingServiceSid,
        direction: message.direction,
        price: message.price
      }
    };
    
  } catch (error: any) {
    console.error('❌ SMS sending failed:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
      details: {
        code: error.code,
        status: error.status,
        moreInfo: error.moreInfo
      }
    };
  }
}

/**
 * Send AetherVault security passcode
 */
export async function sendSecurityPasscode({
  to,
  passcode,
  fileName
}: {
  to: string;
  passcode: string;
  fileName: string;
}): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const messageBody = `🔐 AetherVault Security Code: ${passcode}

Your secure file "${fileName}" is ready for download.

Enter this code to access your file. Code expires in 15 minutes.

Never share this code with anyone.`;

  const result = await sendSMS({
    to,
    body: messageBody
  });

  return {
    success: result.success,
    messageId: result.messageId,
    error: result.error
  };
}

/**
 * Send test SMS (for verification)
 */
export async function sendTestSMS(to: string = '+919385480953'): Promise<boolean> {
  const result = await sendSMS({
    to,
    body: '🏆 AetherVault Test: Your SMS system is working perfectly! 🚀'
  });
  
  return result.success;
}

/**
 * Format phone number to international format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If starts with country code, keep as is
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  
  // If 10 digits, assume Indian number
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  // If already has +, just clean it
  if (phone.startsWith('+')) {
    return `+${digits}`;
  }
  
  // Default to adding +91 for India
  return `+91${digits}`;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  // Basic validation for international format
  return /^\+\d{10,15}$/.test(formatted);
}

// Export configuration for reference
export const twilioConfig = {
  accountSid,
  messagingServiceSid,
  // Don't export authToken for security
  isConfigured: !!(accountSid && authToken && messagingServiceSid)
};

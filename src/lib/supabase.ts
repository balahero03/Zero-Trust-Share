// supabase 



import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY  || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdianZsYWJvZmxoa3ZsYmt1cmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzkxMiwiZXhwIjoyMDczNDgzOTEyfQ.Qi4jY72suoAP1kgGd6mEuTp8aoOjRTNgityFFNSxO3Q"

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}
if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}
if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

// Client-side Supabase client with proper session management
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types
export interface SharedFile {
  id: string
  owner_id: string
  file_name: string
  encrypted_file_name: string
  file_size: number
  file_salt: string
  file_iv: string
  master_key_hash: string
  metadata_iv: string
  expires_at: string | null
  burn_after_read: boolean
  download_count: number
  created_at: string
}

export interface EmailShare {
  id: string
  file_id: string
  sender_id: string
  recipient_email: string
  recipient_id: string | null
  sent_at: string
  opened_at: string | null
  status: 'sent' | 'opened' | 'failed'
}

export interface SMSVerification {
  id: string
  file_id: string
  recipient_phone: string
  recipient_id: string | null
  passcode: string
  expires_at: string
  verified_at: string | null
  attempts: number
  max_attempts: number
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Invitation {
  id: string
  file_id: string
  sender_id: string
  recipient_email: string
  invitation_token: string
  expires_at: string
  accepted_at: string | null
  recipient_id: string | null
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      shared_files: {
        Row: SharedFile
        Insert: Omit<SharedFile, 'id' | 'created_at' | 'download_count'>
        Update: Partial<Omit<SharedFile, 'id' | 'created_at'>>
      }
      email_shares: {
        Row: EmailShare
        Insert: Omit<EmailShare, 'id' | 'sent_at' | 'opened_at'>
        Update: Partial<Omit<EmailShare, 'id' | 'sent_at'>>
      }
      sms_verification: {
        Row: SMSVerification
        Insert: Omit<SMSVerification, 'id' | 'created_at' | 'verified_at' | 'attempts'>
        Update: Partial<Omit<SMSVerification, 'id' | 'created_at'>>
      }
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
      invitations: {
        Row: Invitation
        Insert: Omit<Invitation, 'id' | 'created_at' | 'accepted_at'>
        Update: Partial<Omit<Invitation, 'id' | 'created_at'>>
      }
    }
  }
}

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

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  s3_key: string
  encrypted_file_name: string
  file_size: number
  file_salt: string
  expires_at: string | null
  burn_after_read: boolean
  download_count: number
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
    }
  }
}

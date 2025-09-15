



import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gbjvlaboflhkvlbkuram.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdianZsYWJvZmxoa3ZsYmt1cmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc5MTIsImV4cCI6MjA3MzQ4MzkxMn0.RdY93X6dJ6oyVTAnYP53KyZoSWNGOcqyqhRf4sWUKoA'

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdianZsYWJvZmxoa3ZsYmt1cmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzkxMiwiZXhwIjoyMDczNDgzOTEyfQ.Qi4jY72suoAP1kgGd6mEuTp8aoOjRTNgityFFNSxO3Q',
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

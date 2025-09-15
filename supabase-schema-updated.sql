-- Updated Supabase Schema for Zero-Trust-Share
-- This replaces the old s3_key field with file_name for Supabase Storage

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS shared_files CASCADE;

-- Create shared_files table with updated schema
CREATE TABLE shared_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL, -- Changed from s3_key to file_name for Supabase Storage
  encrypted_file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_salt BYTEA NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  burn_after_read BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE shared_files ENABLE ROW LEVEL SECURITY;

-- Create policies for user isolation
CREATE POLICY "Users can view their own files" ON shared_files
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own files" ON shared_files
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own files" ON shared_files
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own files" ON shared_files
  FOR DELETE USING (auth.uid() = owner_id);

-- Create indexes for better performance
CREATE INDEX idx_shared_files_owner_id ON shared_files(owner_id);
CREATE INDEX idx_shared_files_expires_at ON shared_files(expires_at);
CREATE INDEX idx_shared_files_file_name ON shared_files(file_name);

-- Create storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('aethervault-files', 'aethervault-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'aethervault-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'aethervault-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'aethervault-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Grant necessary permissions
GRANT ALL ON shared_files TO authenticated;
GRANT ALL ON shared_files TO service_role;


-- AetherVault Database Schema
-- This creates the shared_files table for the zero-knowledge file sharing system

-- Create the shared_files table
CREATE TABLE public.shared_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name text NOT NULL UNIQUE,
    encrypted_file_name text NOT NULL,
    file_size bigint NOT NULL,
    file_salt text NOT NULL,
    file_iv text NOT NULL,
    master_key_hash text NOT NULL,
    metadata_iv text NOT NULL,
    expires_at timestamp with time zone,
    burn_after_read boolean DEFAULT false NOT NULL,
    download_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create email_shares table for tracking email sharing
CREATE TABLE public.email_shares (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    file_id uuid NOT NULL REFERENCES public.shared_files(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_email text NOT NULL,
    recipient_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    opened_at timestamp with time zone,
    status text DEFAULT 'sent' NOT NULL CHECK (status IN ('sent', 'opened', 'failed'))
);

-- Create indexes for better performance
CREATE INDEX idx_shared_files_owner_id ON public.shared_files(owner_id);
CREATE INDEX idx_shared_files_expires_at ON public.shared_files(expires_at);
CREATE INDEX idx_shared_files_created_at ON public.shared_files(created_at);
CREATE INDEX idx_email_shares_file_id ON public.email_shares(file_id);
CREATE INDEX idx_email_shares_sender_id ON public.email_shares(sender_id);
CREATE INDEX idx_email_shares_recipient_email ON public.email_shares(recipient_email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.shared_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_shares ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own files
CREATE POLICY "Users can view their own files" ON public.shared_files
    FOR SELECT USING (auth.uid() = owner_id);

-- Users can only insert their own files
CREATE POLICY "Users can insert their own files" ON public.shared_files
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Users can only update their own files
CREATE POLICY "Users can update their own files" ON public.shared_files
    FOR UPDATE USING (auth.uid() = owner_id);

-- Users can only delete their own files
CREATE POLICY "Users can delete their own files" ON public.shared_files
    FOR DELETE USING (auth.uid() = owner_id);

-- Allow anonymous users to read file metadata (for recipients)
CREATE POLICY "Anonymous users can read file metadata" ON public.shared_files
    FOR SELECT USING (true);

-- Email shares policies
CREATE POLICY "Users can view their sent email shares" ON public.email_shares
    FOR SELECT USING (auth.uid() = sender_id);

CREATE POLICY "Users can insert their own email shares" ON public.email_shares
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view email shares sent to them" ON public.email_shares
    FOR SELECT USING (auth.uid() = recipient_id);

-- Create a function to automatically clean up expired files
CREATE OR REPLACE FUNCTION cleanup_expired_files()
RETURNS void AS $$
BEGIN
    DELETE FROM public.shared_files 
    WHERE expires_at IS NOT NULL 
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create a function to increment download count atomically
CREATE OR REPLACE FUNCTION increment_download_count(file_id uuid)
RETURNS integer AS $$
DECLARE
    new_count integer;
BEGIN
    UPDATE public.shared_files 
    SET download_count = download_count + 1 
    WHERE id = file_id
    RETURNING download_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.shared_files TO anon, authenticated;
GRANT ALL ON public.email_shares TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_files() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_download_count(uuid) TO anon, authenticated;

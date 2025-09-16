/**
 * API Route: /api/get-file-metadata/[fileId]
 * Purpose: Provide non-sensitive information a recipient needs to begin decryption
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    // Query the shared_files table
    const { data: fileRecord, error } = await supabaseAdmin
      .from('shared_files')
      .select('file_size, file_salt, file_iv, expires_at, burn_after_read, download_count')
      .eq('id', fileId)
      .single()

    if (error || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if file has expired
    if (fileRecord.expires_at && new Date(fileRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'File has expired' }, { status: 410 })
    }

    // Check if file should be burned after read and has been downloaded
    if (fileRecord.burn_after_read && fileRecord.download_count > 0) {
      return NextResponse.json({ error: 'File has been consumed' }, { status: 410 })
    }

    // Return only non-sensitive metadata
    // Parse JSON strings back to arrays
    return NextResponse.json({
      fileSize: fileRecord.file_size,
      fileSalt: JSON.parse(fileRecord.file_salt),
      fileIv: JSON.parse(fileRecord.file_iv),
      burnAfterRead: fileRecord.burn_after_read,
      downloadCount: fileRecord.download_count
    })

  } catch (error) {
    console.error('Get file metadata error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * API Route: /api/get-file-download/[fileId]
 * Purpose: Get file information for download from Supabase Storage
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
      .select('s3_key, expires_at, burn_after_read, download_count')
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

    return NextResponse.json({
      fileName: fileRecord.s3_key
    })

  } catch (error) {
    console.error('Get file download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
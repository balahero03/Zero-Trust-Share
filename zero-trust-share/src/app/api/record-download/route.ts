/**
 * API Route: /api/record-download
 * Purpose: Record successful download and handle burn-after-read logic
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { deleteFileFromS3 } from '@/lib/aws'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { fileId } = body

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    // Get file record
    const { data: fileRecord, error: fetchError } = await supabaseAdmin
      .from('shared_files')
      .select('s3_key, burn_after_read, download_count')
      .eq('id', fileId)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Increment download count
    const { data: updatedRecord, error: updateError } = await supabaseAdmin
      .from('shared_files')
      .update({ download_count: fileRecord.download_count + 1 })
      .eq('id', fileId)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update download count' }, { status: 500 })
    }

    // If burn_after_read is true, delete the file
    if (fileRecord.burn_after_read) {
      try {
        // Delete from S3
        await deleteFileFromS3(fileRecord.s3_key)
        
        // Delete from database
        await supabaseAdmin
          .from('shared_files')
          .delete()
          .eq('id', fileId)
      } catch (deleteError) {
        console.error('Delete error:', deleteError)
        // Don't fail the request if deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      downloadCount: updatedRecord.download_count,
      burned: fileRecord.burn_after_read
    })

  } catch (error) {
    console.error('Record download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

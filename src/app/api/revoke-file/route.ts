/**
 * API Route: /api/revoke-file
 * Purpose: Revoke access to a file by deleting it from S3 and database
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { deleteFileFromS3 } from '@/lib/aws'

export async function DELETE(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { fileId } = body

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    // Get file record and verify ownership
    const { data: fileRecord, error: fetchError } = await supabaseAdmin
      .from('shared_files')
      .select('s3_key, owner_id')
      .eq('id', fileId)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Verify ownership
    if (fileRecord.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
      // Delete from S3
      await deleteFileFromS3(fileRecord.s3_key)
    } catch (s3Error) {
      console.error('S3 delete error:', s3Error)
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('shared_files')
      .delete()
      .eq('id', fileId)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete file record' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Revoke file error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

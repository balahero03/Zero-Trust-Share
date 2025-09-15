/**
 * API Route: /api/prepare-upload
 * Purpose: Securely prepare backend for file upload by creating database record and one-time AWS upload link
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateUploadUrl } from '@/lib/azure'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
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
    const { 
      encryptedFileName, 
      fileSize, 
      fileSalt, 
      burnAfterRead = false, 
      expiryHours = 24 
    } = body

    if (!encryptedFileName || !fileSize || !fileSalt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate unique blob name
    const fileId = uuidv4()
    const blobName = `${user.id}/${fileId}`

    // Generate pre-signed upload URL (expires in 5 minutes)
    const uploadUrl = await generateUploadUrl(blobName, 300)

    // Calculate expiry time
    const expiresAt = expiryHours > 0 
      ? new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
      : null

    // Create database record
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('shared_files')
      .insert({
        owner_id: user.id,
        s3_key: blobName, // Using s3_key field for blob name
        encrypted_file_name: encryptedFileName,
        file_size: fileSize,
        file_salt: fileSalt,
        expires_at: expiresAt,
        burn_after_read: burnAfterRead,
        download_count: 0
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to create file record' }, { status: 500 })
    }

    return NextResponse.json({
      uploadUrl,
      fileId: fileRecord.id,
      s3Key: blobName // Keep s3Key for compatibility
    })

  } catch (error) {
    console.error('Prepare upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

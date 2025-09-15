/**
 * API Route: /api/prepare-upload
 * Purpose: Securely prepare backend for file upload by creating database record
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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
      fileIv,
      burnAfterRead = false, 
      expiryHours = 24 
    } = body

    if (!encryptedFileName || !fileSize || !fileSalt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate unique file name for Supabase Storage
    const fileId = uuidv4()
    const fileName = `${user.id}/${fileId}`

    // Calculate expiry time
    const expiresAt = expiryHours > 0 
      ? new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
      : null

    // Create database record
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('shared_files')
      .insert({
        owner_id: user.id,
        s3_key: fileName, // Using s3_key field (will be renamed to file_name after DB update)
        encrypted_file_name: encryptedFileName,
        file_size: fileSize,
        file_salt: fileSalt,
        file_iv: fileIv || 'temp-iv', // Temporary fix
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
      fileName,
      fileId: fileRecord.id
    })

  } catch (error) {
    console.error('Prepare upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
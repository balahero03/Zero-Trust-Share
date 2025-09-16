/**
 * 🏆 Award-Winning SMS Passcode Verification API
 * Verifies SMS passcodes and returns decryption key for seamless download
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySMSPasscode } from '@/lib/sms-utils'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { fileId, phone, passcode } = body

    if (!fileId || !phone || !passcode) {
      return NextResponse.json({ 
        error: 'Missing required fields: fileId, phone, and passcode' 
      }, { status: 400 })
    }

    // Validate passcode format (6 digits)
    if (!/^\d{6}$/.test(passcode)) {
      return NextResponse.json({ 
        error: 'Invalid passcode format. Must be 6 digits.' 
      }, { status: 400 })
    }

    // Verify the passcode
    const verificationResult = await verifySMSPasscode({
      fileId,
      phone,
      passcode
    })

    if (!verificationResult.success) {
      let statusCode = 400
      
      if (verificationResult.expired) {
        statusCode = 410 // Gone - passcode expired
      } else if (verificationResult.maxAttemptsReached) {
        statusCode = 429 // Too Many Requests
      }

      return NextResponse.json({ 
        error: verificationResult.error,
        expired: verificationResult.expired,
        maxAttemptsReached: verificationResult.maxAttemptsReached
      }, { status: statusCode })
    }

    // Get file metadata and encryption details
    const { data: fileRecord, error: fileError } = await supabaseAdmin
      .from('shared_files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fileError || !fileRecord) {
      return NextResponse.json({ 
        error: 'File not found or has been removed' 
      }, { status: 404 })
    }

    // Check if file has expired
    if (fileRecord.expires_at && new Date(fileRecord.expires_at) < new Date()) {
      return NextResponse.json({ 
        error: 'File has expired' 
      }, { status: 410 })
    }

    // Check burn after read
    if (fileRecord.burn_after_read && fileRecord.download_count > 0) {
      return NextResponse.json({ 
        error: 'File has already been downloaded and consumed' 
      }, { status: 410 })
    }

    // Return file metadata and encryption details for client-side decryption
    // Note: We return the master_key_hash which the client uses to derive the actual decryption key
    // Parse JSON strings back to arrays
    return NextResponse.json({
      success: true,
      verificationId: verificationResult.verificationId,
      file: {
        id: fileRecord.id,
        fileName: fileRecord.file_name,
        fileSize: fileRecord.file_size,
        fileSalt: JSON.parse(fileRecord.file_salt),
        fileIv: JSON.parse(fileRecord.file_iv),
        masterKeyHash: fileRecord.master_key_hash,
        metadataIv: fileRecord.metadata_iv,
        burnAfterRead: fileRecord.burn_after_read,
        downloadCount: fileRecord.download_count,
        expiresAt: fileRecord.expires_at
      },
      message: 'SMS verification successful. File ready for download.'
    })

  } catch (error) {
    console.error('Verify SMS passcode error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET endpoint to check verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const phone = searchParams.get('phone')

    if (!fileId || !phone) {
      return NextResponse.json({ 
        error: 'fileId and phone parameters required' 
      }, { status: 400 })
    }

    // Get verification status
    const { data: verification, error } = await supabaseAdmin
      .from('sms_verification')
      .select('verified_at, expires_at, attempts, max_attempts, created_at')
      .eq('file_id', fileId)
      .eq('recipient_phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !verification) {
      return NextResponse.json({ 
        error: 'No verification found' 
      }, { status: 404 })
    }

    const now = new Date()
    const isExpired = new Date(verification.expires_at) < now
    const isVerified = !!verification.verified_at
    const attemptsRemaining = verification.max_attempts - verification.attempts

    return NextResponse.json({
      success: true,
      status: {
        verified: isVerified,
        expired: isExpired,
        attempts: verification.attempts,
        maxAttempts: verification.max_attempts,
        attemptsRemaining,
        sentAt: verification.created_at,
        expiresAt: verification.expires_at,
        verifiedAt: verification.verified_at
      }
    })

  } catch (error) {
    console.error('Get verification status error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

/**
 * 🏆 Award-Winning SMS Passcode API
 * Sends secure SMS passcodes with rate limiting and validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { 
  generatePasscode, 
  sendSMSPasscode, 
  storeSMSVerification, 
  checkSMSRateLimit,
  formatPhoneNumber 
} from '@/lib/sms-utils'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { fileId, recipients } = body

    if (!fileId || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json({ 
        error: 'Missing required fields: fileId and recipients array' 
      }, { status: 400 })
    }

    // Validate that file exists
    const { data: fileRecord, error: fileError } = await supabaseAdmin
      .from('shared_files')
      .select('id, file_name, owner_id')
      .eq('id', fileId)
      .single()

    if (fileError || !fileRecord) {
      return NextResponse.json({ 
        error: 'File not found' 
      }, { status: 404 })
    }

    const results = []
    
    for (const recipient of recipients) {
      const { email, phone, userId } = recipient
      
      if (!phone) {
        results.push({
          email,
          success: false,
          error: 'No phone number available'
        })
        continue
      }

      try {
        const formattedPhone = formatPhoneNumber(phone)
        
        // Check rate limiting
        const rateLimitCheck = await checkSMSRateLimit(formattedPhone)
        if (!rateLimitCheck.allowed) {
          results.push({
            email,
            phone: formattedPhone,
            success: false,
            error: `Rate limit exceeded. Try again in ${rateLimitCheck.remainingTime} minutes.`
          })
          continue
        }

        // Generate passcode
        const passcode = generatePasscode()

        // Store verification record
        const storeResult = await storeSMSVerification({
          fileId,
          recipientPhone: formattedPhone,
          recipientId: userId,
          passcode
        })

        if (!storeResult.success) {
          results.push({
            email,
            phone: formattedPhone,
            success: false,
            error: storeResult.error
          })
          continue
        }

        // Send SMS
        const smsResult = await sendSMSPasscode({
          phone: formattedPhone,
          passcode,
          fileName: fileRecord.file_name
        })

        results.push({
          email,
          phone: formattedPhone,
          success: smsResult.success,
          error: smsResult.error,
          messageId: smsResult.messageId,
          verificationId: storeResult.verificationId
        })

      } catch (error) {
        console.error('Error processing recipient:', email, error)
        results.push({
          email,
          phone: phone || 'unknown',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return NextResponse.json({
      success: successCount > 0,
      sent: successCount,
      total: totalCount,
      results,
      message: `Successfully sent ${successCount} of ${totalCount} SMS passcodes`
    })

  } catch (error) {
    console.error('Send SMS passcode error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET endpoint to check SMS sending status/statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ 
        error: 'fileId parameter required' 
      }, { status: 400 })
    }

    // Get SMS verification statistics
    const { data, error } = await supabaseAdmin
      .from('sms_verification')
      .select('recipient_phone, verified_at, expires_at, attempts, created_at')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get SMS stats error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch SMS statistics' 
      }, { status: 500 })
    }

    const now = new Date()
    const stats = {
      total: data.length,
      verified: 0,
      expired: 0,
      pending: 0,
      details: data.map(record => ({
        phone: record.recipient_phone,
        verified: !!record.verified_at,
        expired: new Date(record.expires_at) < now,
        attempts: record.attempts,
        sent_at: record.created_at
      }))
    }

    data.forEach(record => {
      if (record.verified_at) {
        stats.verified++
      } else if (new Date(record.expires_at) < now) {
        stats.expired++
      } else {
        stats.pending++
      }
    })

    return NextResponse.json({
      success: true,
      fileId,
      stats
    })

  } catch (error) {
    console.error('Get SMS statistics error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

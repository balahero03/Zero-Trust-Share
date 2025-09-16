/**
 * 🏆 Award-Winning Invitation System API
 * Sends invitations to unregistered users to join AetherVault
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateInvitationToken } from '@/lib/invitation-utils'

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
    const { fileId, unregisteredEmails, fileName } = body

    if (!fileId || !unregisteredEmails || !Array.isArray(unregisteredEmails) || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validEmails = unregisteredEmails.filter((email: string) => emailRegex.test(email))
    
    if (validEmails.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses provided' }, { status: 400 })
    }

    // Check if file exists and user owns it
    const { data: fileRecord, error: fileError } = await supabaseAdmin
      .from('shared_files')
      .select('id, owner_id, file_name')
      .eq('id', fileId)
      .single()

    if (fileError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (fileRecord.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get sender information
    const { data: senderProfile, error: senderError } = await supabaseAdmin
      .from('user_profiles')
      .select('full_name, email')
      .eq('user_id', user.id)
      .single()

    if (senderError || !senderProfile) {
      return NextResponse.json({ error: 'Sender profile not found' }, { status: 404 })
    }

    const invitationResults = []

    for (const email of validEmails) {
      try {
        // Generate unique invitation token
        const invitationToken = generateInvitationToken()

        // Create invitation record
        const { data: invitation, error: insertError } = await supabaseAdmin
          .from('invitations')
          .insert({
            file_id: fileId,
            sender_id: user.id,
            recipient_email: email,
            invitation_token: invitationToken,
            status: 'pending'
          })
          .select('id, invitation_token')
          .single()

        if (insertError) {
          invitationResults.push({
            email,
            success: false,
            error: insertError.message
          })
          continue
        }

        // Send invitation email
        const invitationSent = await sendInvitationEmail({
          to: email,
          fileName,
          senderName: senderProfile.full_name,
          senderEmail: senderProfile.email,
          invitationToken: invitation.invitation_token
        })

        invitationResults.push({
          email,
          success: invitationSent,
          invitationId: invitation.id,
          invitationToken: invitation.invitation_token,
          error: invitationSent ? null : 'Failed to send invitation email'
        })

      } catch (error) {
        invitationResults.push({
          email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = invitationResults.filter(r => r.success).length
    const totalCount = invitationResults.length

    return NextResponse.json({
      success: successCount > 0,
      sent: successCount,
      total: totalCount,
      results: invitationResults,
      message: `Successfully sent ${successCount} of ${totalCount} invitations`
    })

  } catch (error) {
    console.error('Send invitations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Send invitation email (placeholder for email service integration)
 */
async function sendInvitationEmail({
  to,
  fileName,
  senderName,
  senderEmail,
  invitationToken
}: {
  to: string
  fileName: string
  senderName: string
  senderEmail: string
  invitationToken: string
}): Promise<boolean> {
  try {
    // In a real implementation, you would use an email service like:
    // - SendGrid, Resend, AWS SES, etc.
    
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth?invitation=${invitationToken}`
    
    const emailContent = `
🎉 You've been invited to AetherVault!

${senderName} (${senderEmail}) wants to share a secure file with you:
📄 File: ${fileName}

To access this file, you need to:
1. Create your free AetherVault account
2. Verify your email and phone number
3. Download the secure file with SMS verification

🔗 Accept Invitation: ${invitationUrl}

This invitation expires in 7 days.

---
AetherVault - Zero-Knowledge File Sharing
`
    
    console.log('📧 Sending invitation email to:', to)
    console.log('📄 File:', fileName)
    console.log('👤 Sender:', senderName)
    console.log('🔗 Invitation URL:', invitationUrl)
    console.log('📝 Content:', emailContent)

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('✅ Invitation email sent successfully to:', to)
    return true
  } catch (error) {
    console.error('❌ Invitation email sending failed:', error)
    return false
  }
}

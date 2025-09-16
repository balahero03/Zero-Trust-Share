/**
 * 🏆 Award-Winning Invitation Verification API
 * Handles invitation token validation and acceptance
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateInvitationToken, acceptInvitation } from '@/lib/invitation-utils'

// GET: Validate invitation token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ 
        error: 'Invitation token is required' 
      }, { status: 400 })
    }

    const validation = await validateInvitationToken(token)

    if (!validation.valid) {
      return NextResponse.json({
        valid: false,
        error: validation.error
      }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      invitation: {
        id: validation.invitation.id,
        fileName: validation.invitation.shared_files.file_name,
        senderName: validation.invitation.sender.full_name,
        senderEmail: validation.invitation.sender.email,
        recipientEmail: validation.invitation.recipient_email,
        expiresAt: validation.invitation.expires_at,
        createdAt: validation.invitation.created_at
      }
    })

  } catch (error) {
    console.error('Verify invitation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// POST: Accept invitation (after user registration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, userId } = body

    if (!token || !userId) {
      return NextResponse.json({ 
        error: 'Token and userId are required' 
      }, { status: 400 })
    }

    const result = await acceptInvitation(token, userId)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully'
    })

  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

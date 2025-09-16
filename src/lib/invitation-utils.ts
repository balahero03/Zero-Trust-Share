/**
 * 🏆 Award-Winning Invitation System Utilities
 * Handles invitation token generation and validation
 */

import { supabaseAdmin } from './supabase'
import { randomBytes } from 'crypto'

/**
 * Generate a secure invitation token
 */
export function generateInvitationToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Validate invitation token and get invitation details
 */
export async function validateInvitationToken(token: string): Promise<{
  valid: boolean
  invitation?: any
  error?: string
}> {
  try {
    if (!token) {
      return { valid: false, error: 'No invitation token provided' }
    }

    // Get invitation record
    const { data: invitation, error } = await supabaseAdmin
      .from('invitations')
      .select(`
        *,
        shared_files(file_name, owner_id),
        sender:user_profiles!sender_id(full_name, email)
      `)
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single()

    if (error || !invitation) {
      return { valid: false, error: 'Invalid or expired invitation' }
    }

    // Check if invitation has expired
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    
    if (now > expiresAt) {
      // Mark as expired
      await supabaseAdmin
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)
      
      return { valid: false, error: 'Invitation has expired' }
    }

    return { valid: true, invitation }
  } catch (error) {
    console.error('Invitation validation error:', error)
    return { valid: false, error: 'Failed to validate invitation' }
  }
}

/**
 * Accept invitation after user registration
 */
export async function acceptInvitation(
  token: string, 
  userId: string
): Promise<{ success: boolean, error?: string }> {
  try {
    // Validate invitation first
    const validation = await validateInvitationToken(token)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Update invitation status
    const { error: updateError } = await supabaseAdmin
      .from('invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        recipient_id: userId
      })
      .eq('invitation_token', token)

    if (updateError) {
      console.error('Failed to accept invitation:', updateError)
      return { success: false, error: 'Failed to accept invitation' }
    }

    return { success: true }
  } catch (error) {
    console.error('Accept invitation error:', error)
    return { success: false, error: 'Failed to accept invitation' }
  }
}

/**
 * Get user's pending invitations
 */
export async function getUserInvitations(email: string): Promise<{
  success: boolean
  invitations?: any[]
  error?: string
}> {
  try {
    const { data: invitations, error } = await supabaseAdmin
      .from('invitations')
      .select(`
        *,
        shared_files(file_name, created_at),
        sender:user_profiles!sender_id(full_name, email)
      `)
      .eq('recipient_email', email)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get invitations error:', error)
      return { success: false, error: 'Failed to get invitations' }
    }

    return { success: true, invitations: invitations || [] }
  } catch (error) {
    console.error('Get user invitations error:', error)
    return { success: false, error: 'Failed to get invitations' }
  }
}

/**
 * Check if email has pending invitations
 */
export async function checkPendingInvitations(email: string): Promise<{
  hasPending: boolean
  count: number
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('recipient_email', email)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())

    if (error) {
      console.error('Check pending invitations error:', error)
      return { hasPending: false, count: 0 }
    }

    const count = data?.length || 0
    return { hasPending: count > 0, count }
  } catch (error) {
    console.error('Check pending invitations error:', error)
    return { hasPending: false, count: 0 }
  }
}

/**
 * Auto-accept invitations for newly registered user
 */
export async function autoAcceptInvitations(email: string, userId: string): Promise<void> {
  try {
    // Get all pending invitations for this email
    const { data: invitations, error } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('recipient_email', email)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())

    if (error || !invitations || invitations.length === 0) {
      return
    }

    // Accept all pending invitations
    const { error: updateError } = await supabaseAdmin
      .from('invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        recipient_id: userId
      })
      .eq('recipient_email', email)
      .eq('status', 'pending')

    if (updateError) {
      console.error('Auto-accept invitations error:', updateError)
    } else {
      console.log(`✅ Auto-accepted ${invitations.length} invitations for ${email}`)
    }
  } catch (error) {
    console.error('Auto-accept invitations error:', error)
  }
}

/**
 * Clean up expired invitations
 */
export async function cleanupExpiredInvitations(): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('invitations')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString())

    if (error) {
      console.error('Cleanup expired invitations error:', error)
    } else {
      console.log('✅ Cleaned up expired invitations')
    }
  } catch (error) {
    console.error('Cleanup expired invitations error:', error)
  }
}

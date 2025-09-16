/**
 * API Route: /api/my-files
 * Purpose: Get all files for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
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

    // Get user's files
    const { data: files, error } = await supabaseAdmin
      .from('shared_files')
      .select('id, encrypted_file_name, file_size, expires_at, burn_after_read, download_count, created_at, metadata_iv, master_key_hash')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
    }

    return NextResponse.json({ files })

  } catch (error) {
    console.error('Get my files error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

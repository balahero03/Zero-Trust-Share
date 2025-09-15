/**
 * 🏆 Award-Winning Email Share Modal
 * Perfect UI for sharing files via email with validation and error handling
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface EmailShareModalProps {
  isOpen: boolean
  onClose: () => void
  fileId: string
  fileName: string
  shareUrl: string
}

interface EmailValidation {
  email: string
  isValid: boolean
  isRegistered: boolean
  error?: string
}

export function EmailShareModal({ isOpen, onClose, fileId, fileName, shareUrl }: EmailShareModalProps) {
  const [emails, setEmails] = useState<EmailValidation[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmails([])
      setNewEmail('')
      setSendStatus('idle')
      setErrorMessage('')
    }
  }, [isOpen])

  // Validate email format
  const isValidEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  // Check if email is registered user
  const checkEmailRegistration = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single()

      return !error && !!data
    } catch (error) {
      console.error('Error checking email registration:', error)
      return false
    }
  }, [])

  // Add email to list
  const addEmail = useCallback(async () => {
    if (!newEmail.trim()) return

    const email = newEmail.trim().toLowerCase()
    
    // Check if email already exists
    if (emails.some(e => e.email === email)) {
      setErrorMessage('This email has already been added')
      return
    }

    // Validate email format
    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      // Check if user is registered
      const isRegistered = await checkEmailRegistration(email)
      
      const emailValidation: EmailValidation = {
        email,
        isValid: true,
        isRegistered,
        error: isRegistered ? undefined : 'This email is not registered with AetherVault'
      }

      setEmails(prev => [...prev, emailValidation])
      setNewEmail('')
    } catch {
      setErrorMessage('Failed to validate email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [newEmail, emails, isValidEmail, checkEmailRegistration])

  // Remove email from list
  const removeEmail = useCallback((emailToRemove: string) => {
    setEmails(prev => prev.filter(e => e.email !== emailToRemove))
  }, [])

  // Send emails
  const sendEmails = useCallback(async () => {
    const validEmails = emails.filter(e => e.isValid && e.isRegistered)
    
    if (validEmails.length === 0) {
      setErrorMessage('Please add at least one valid registered email')
      return
    }

    setIsSending(true)
    setErrorMessage('')

    try {
      // Send emails via API
      const response = await fetch('/api/send-share-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          recipientEmails: validEmails.map(e => e.email),
          shareUrl,
          fileName
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send emails')
      }

      setSendStatus('success')
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Send emails error:', error)
      setSendStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send emails')
    } finally {
      setIsSending(false)
    }
  }, [emails, fileId, shareUrl, fileName, onClose])

  // Handle Enter key
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEmail()
    }
  }, [addEmail])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Share via Email</h2>
            <p className="text-text-secondary text-sm">Send secure file access to registered users</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* File Info */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-electric-blue/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-text-primary font-medium">{fileName}</p>
              <p className="text-text-secondary text-sm">Ready to share securely</p>
            </div>
          </div>
        </div>

        {/* Email Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Add Recipient Emails
          </label>
          <div className="flex space-x-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter email address..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
              disabled={isLoading}
            />
            <button
              onClick={addEmail}
              disabled={isLoading || !newEmail.trim()}
              className="px-6 py-3 bg-electric-blue hover:bg-electric-blue-dark disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-electric-blue/25"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                'Add'
              )}
            </button>
          </div>
        </div>

        {/* Email List */}
        {emails.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-text-primary mb-3">
              Recipients ({emails.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {emails.map((email, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    email.isRegistered 
                      ? 'bg-success/10 border-success/20' 
                      : 'bg-error/10 border-error/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      email.isRegistered ? 'bg-success' : 'bg-error'
                    }`}></div>
                    <span className="text-text-primary">{email.email}</span>
                    {!email.isRegistered && (
                      <span className="text-error text-sm">Not registered</span>
                    )}
                  </div>
                  <button
                    onClick={() => removeEmail(email.email)}
                    className="text-text-secondary hover:text-error transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-error text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {sendStatus === 'success' && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-success text-sm">Emails sent successfully! Closing modal...</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-text-primary rounded-lg font-semibold transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={sendEmails}
            disabled={isSending || emails.filter(e => e.isRegistered).length === 0}
            className="flex-1 px-6 py-3 bg-electric-blue hover:bg-electric-blue-dark disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-electric-blue/25"
          >
            {isSending ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Sending...</span>
              </div>
            ) : (
              `Send to ${emails.filter(e => e.isRegistered).length} Recipients`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

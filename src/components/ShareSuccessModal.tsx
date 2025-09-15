/**
 * 🏆 Award-Winning Share Success Modal
 * Perfect UI for showing successful file upload with sharing options
 */

'use client'

import { useState, useCallback } from 'react'
import { EmailShareModal } from './EmailShareModal'

interface ShareSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  fileId: string
  fileName: string
  shareUrl: string
  fileSize: number
}

export function ShareSuccessModal({ 
  isOpen, 
  onClose, 
  fileId, 
  fileName, 
  shareUrl, 
  fileSize 
}: ShareSuccessModalProps) {
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [copied, setCopied] = useState(false)

  // Copy share URL to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [shareUrl])

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 w-full max-w-lg animate-slide-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-text-primary mb-2">File Secured!</h2>
            <p className="text-text-secondary">
              Your file has been encrypted and uploaded successfully
            </p>
          </div>

          {/* File Info */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary">{fileName}</h3>
                <p className="text-text-secondary text-sm">{formatFileSize(fileSize)}</p>
              </div>
            </div>

            {/* Security Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-text-secondary text-sm">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-text-secondary text-sm">Zero-Knowledge</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-text-secondary text-sm">Secure Storage</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-text-secondary text-sm">Access Control</span>
              </div>
            </div>
          </div>

          {/* Share URL */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Share Link
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  copied
                    ? 'bg-success text-white'
                    : 'bg-electric-blue hover:bg-electric-blue-dark text-white transform hover:scale-105'
                }`}
              >
                {copied ? (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setShowEmailModal(true)}
              className="w-full px-6 py-4 bg-electric-blue hover:bg-electric-blue-dark text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-electric-blue/25"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Share via Email</span>
              </div>
            </button>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-text-primary rounded-lg font-semibold transition-all duration-300"
            >
              Done
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-electric-blue/10 border border-electric-blue/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-electric-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-electric-blue mb-1">Security Notice</h4>
                <p className="text-sm text-text-secondary">
                  Only share this link with trusted recipients. The file is encrypted and can only be accessed with the correct passcode.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Share Modal */}
      <EmailShareModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        fileId={fileId}
        fileName={fileName}
        shareUrl={shareUrl}
      />
    </>
  )
}

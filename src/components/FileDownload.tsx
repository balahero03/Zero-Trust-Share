/**
 * 🏆 Award-Winning File Download Component
 * Seamless SMS passcode → auto-decrypt → download flow
 */

'use client'

import { useState, useEffect } from 'react'
import { decryptFile } from '@/lib/encryption'
import { downloadFile } from '@/lib/storage'
import { SMSPasscodeInput } from './SMSPasscodeInput'

interface FileDownloadProps {
  onBack: () => void
  initialFileId?: string
  initialKey?: string
}

type DownloadStep = 'file-id' | 'sms-verification' | 'downloading' | 'success' | 'error'

interface FileMetadata {
  id: string
  fileName: string
  fileSize: number
  fileSalt: number[]
  fileIv: number[]
  masterKeyHash: string
  metadataIv: string
  burnAfterRead: boolean
  downloadCount: number
  expiresAt: string | null
  passcode?: string
}

export function FileDownload({ onBack, initialFileId, initialKey }: FileDownloadProps) {
  const [fileId, setFileId] = useState(initialFileId || '')
  const [currentStep, setCurrentStep] = useState<DownloadStep>('file-id')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [error, setError] = useState('')
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null)
  const [passcodeError, setPasscodeError] = useState('')
  const [verificationAttempts, setVerificationAttempts] = useState(0)

  // Extract file ID from URL if present
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialFileId) {
      const pathParts = window.location.pathname.split('/')
      if (pathParts.length > 2 && pathParts[1] === 'file') {
        setFileId(pathParts[2])
      }
    }
  }, [initialFileId])

  // Auto-proceed if we have fileId and key (legacy support)
  useEffect(() => {
    if (initialFileId && initialKey) {
      handleLegacyDownload()
    }
  }, [initialFileId, initialKey])

  // Step 1: Validate file ID and get basic info
  const handleFileIdSubmit = async () => {
    if (!fileId.trim()) {
      setError('Please enter a valid file ID')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Check if file exists and get basic metadata
      const response = await fetch(`/api/get-file-metadata/${fileId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('File not found. Please check your file ID.')
        } else if (response.status === 410) {
          throw new Error('This file has expired or been consumed.')
        }
        throw new Error('Unable to access file. Please try again.')
      }

      const metadata = await response.json()
      setCurrentStep('sms-verification')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate file ID')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Handle SMS passcode verification
  const handlePasscodeComplete = async (passcode: string) => {
    setIsLoading(true)
    setPasscodeError('')
    setVerificationAttempts(prev => prev + 1)

    try {
      // Verify SMS passcode and get file metadata
      const response = await fetch('/api/verify-sms-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          phone: phoneNumber,
          passcode
        })
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 410) {
          setPasscodeError('Your passcode has expired. Please request a new one.')
        } else if (response.status === 429) {
          setPasscodeError('Maximum verification attempts reached. Please contact the sender.')
        } else {
          setPasscodeError(result.error || 'Invalid passcode. Please try again.')
        }
        return
      }

      // SMS verification successful - proceed to download
      const fileMetadata = { ...result.file, passcode }
      setFileMetadata(fileMetadata)
      setCurrentStep('downloading')
      
      // Start automatic download
      await performDownload(fileMetadata)

    } catch (err) {
      setPasscodeError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Perform the actual download with auto-decryption
  const performDownload = async (metadata: FileMetadata) => {
    setDownloadProgress(0)

    try {
      // Step 1: Download encrypted file
      setDownloadProgress(20)
      const encryptedData = await downloadFile(metadata.id)

      // Step 2: Get the passcode from SMS verification result
      setDownloadProgress(40)
      // The passcode should be passed from the SMS verification step
      // For now, we'll need to get it from the verification result
      const passcode = metadata.passcode || ''

      // Step 3: Decrypt file
      setDownloadProgress(60)
      const decryptedBlob = await decryptFile(
        encryptedData,
        passcode,
        new Uint8Array(metadata.fileSalt),
        new Uint8Array(metadata.fileIv)
      )

      // Step 4: Trigger download
      setDownloadProgress(80)
      const url = URL.createObjectURL(decryptedBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = metadata.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Step 5: Record download
      setDownloadProgress(90)
      await fetch('/api/record-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: metadata.id })
      })

      setDownloadProgress(100)
      setCurrentStep('success')

    } catch (err) {
      console.error('Download failed:', err)
      setError(err instanceof Error ? err.message : 'Download failed')
      setCurrentStep('error')
    }
  }

  // Legacy download support (for existing URLs with keys)
  const handleLegacyDownload = async () => {
    if (!initialFileId || !initialKey) return

    setCurrentStep('downloading')
    setDownloadProgress(0)

    try {
      // Get file metadata
      setDownloadProgress(10)
      const metadata = await fetch(`/api/get-file-metadata/${initialFileId}`).then(res => {
        if (!res.ok) throw new Error('File not found or expired')
        return res.json()
      })

      // Download encrypted file
      setDownloadProgress(30)
      const encryptedData = await downloadFile(initialFileId)

      // Decrypt file
      setDownloadProgress(70)
      const decryptedBlob = await decryptFile(
        encryptedData,
        initialKey,
        new Uint8Array(metadata.fileSalt),
        new Uint8Array(metadata.fileIv)
      )

      // Download file
      setDownloadProgress(90)
      const url = URL.createObjectURL(decryptedBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `secure-file-${initialFileId}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Record download
      await fetch('/api/record-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: initialFileId })
      })

      setDownloadProgress(100)
      setCurrentStep('success')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
      setCurrentStep('error')
    }
  }

  // Resend SMS passcode
  const handleResendPasscode = async () => {
    // In a real implementation, this would trigger the resend API
    console.log('Resending SMS passcode...')
    setPasscodeError('')
    setVerificationAttempts(0)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Step 1: File ID Input */}
        {currentStep === 'file-id' && (
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">AetherVault</h1>
              <p className="text-text-secondary">Enter the file ID from your email</p>
            </div>

            {/* File ID Input */}
            <div className="space-y-4">
              <div>
                <label htmlFor="fileId" className="block text-sm font-medium text-text-primary mb-2">
                  File ID
                </label>
                <input
                  id="fileId"
                  type="text"
                  value={fileId}
                  onChange={(e) => setFileId(e.target.value)}
                  placeholder="Enter the file ID from your email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300 font-mono"
                  disabled={isLoading}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleFileIdSubmit()}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number for SMS verification"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                  disabled={isLoading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-error text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleFileIdSubmit}
                disabled={isLoading || !fileId.trim() || !phoneNumber.trim()}
                className="w-full py-3 px-4 bg-electric-blue hover:bg-electric-blue-dark disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Validating...</span>
                  </div>
                ) : (
                  'Continue to SMS Verification'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: SMS Verification */}
        {currentStep === 'sms-verification' && (
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-8">
            <SMSPasscodeInput
              onComplete={handlePasscodeComplete}
              onResend={handleResendPasscode}
              isLoading={isLoading}
              error={passcodeError}
              phone={phoneNumber}
              disabled={false}
            />
            
            {/* Back Button */}
            <div className="mt-6">
              <button
                onClick={() => setCurrentStep('file-id')}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-text-primary font-medium rounded-lg transition-all duration-300"
              >
                ← Back to File ID
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Downloading */}
        {currentStep === 'downloading' && (
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 text-center">
            {/* Loading Animation */}
            <div className="w-20 h-20 mx-auto mb-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-electric-blue/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-text-primary mb-2">Decrypting Your File</h2>
            <p className="text-text-secondary mb-6">
              {fileMetadata ? `Downloading ${fileMetadata.fileName}` : 'Preparing download...'}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Progress</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-electric-blue to-electric-blue-light h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-electric-blue/10 border border-electric-blue/20 rounded-lg p-4">
              <p className="text-electric-blue text-sm">
                🔒 Your file is being decrypted locally in your browser for maximum security
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {currentStep === 'success' && (
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-success mb-2">Download Complete!</h2>
            <p className="text-text-secondary mb-6">
              {fileMetadata ? fileMetadata.fileName : 'Your file'} has been successfully downloaded and decrypted.
            </p>

            {fileMetadata && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-success font-medium text-sm">{fileMetadata.fileName}</p>
                    <p className="text-success text-xs">{formatFileSize(fileMetadata.fileSize)}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={onBack}
              className="w-full py-3 px-4 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300"
            >
              Done
            </button>
          </div>
        )}

        {/* Step 5: Error */}
        {currentStep === 'error' && (
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-error rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-error mb-2">Download Failed</h2>
            <p className="text-text-secondary mb-6">{error}</p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setCurrentStep('file-id')
                  setError('')
                  setPasscodeError('')
                  setDownloadProgress(0)
                }}
                className="w-full py-3 px-4 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300"
              >
                Try Again
              </button>
              
              <button
                onClick={onBack}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-text-primary font-medium rounded-lg transition-all duration-300"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
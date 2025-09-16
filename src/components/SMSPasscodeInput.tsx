/**
 * 🏆 Award-Winning SMS Passcode Input Component
 * Beautiful 6-digit OTP input with auto-paste, auto-focus, and premium UX
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface SMSPasscodeInputProps {
  onComplete: (passcode: string) => void
  onResend?: () => void
  isLoading?: boolean
  error?: string
  phone?: string
  disabled?: boolean
  autoFocus?: boolean
}

export function SMSPasscodeInput({
  onComplete,
  onResend,
  isLoading = false,
  error,
  phone,
  disabled = false,
  autoFocus = true
}: SMSPasscodeInputProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [activeIndex, setActiveIndex] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Format phone number for display
  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [autoFocus, disabled])

  // Handle resend countdown
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // Handle input change
  const handleInputChange = useCallback((index: number, value: string) => {
    if (disabled) return

    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)
    
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)

    // Auto-advance to next input
    if (digit && index < 5) {
      const nextInput = inputRefs.current[index + 1]
      if (nextInput) {
        nextInput.focus()
        setActiveIndex(index + 1)
      }
    }

    // Check if all digits filled
    if (newDigits.every(d => d !== '')) {
      const passcode = newDigits.join('')
      onComplete(passcode)
    }
  }, [digits, disabled, onComplete])

  // Handle key down events
  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === 'Backspace') {
      e.preventDefault()
      const newDigits = [...digits]
      
      if (digits[index]) {
        // Clear current digit
        newDigits[index] = ''
        setDigits(newDigits)
      } else if (index > 0) {
        // Move to previous input and clear it
        newDigits[index - 1] = ''
        setDigits(newDigits)
        const prevInput = inputRefs.current[index - 1]
        if (prevInput) {
          prevInput.focus()
          setActiveIndex(index - 1)
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      const prevInput = inputRefs.current[index - 1]
      if (prevInput) {
        prevInput.focus()
        setActiveIndex(index - 1)
      }
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault()
      const nextInput = inputRefs.current[index + 1]
      if (nextInput) {
        nextInput.focus()
        setActiveIndex(index + 1)
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const passcode = digits.join('')
      if (passcode.length === 6) {
        onComplete(passcode)
      }
    }
  }, [digits, disabled, onComplete])

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (disabled) return

    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    if (paste.length === 6) {
      const newDigits = paste.split('')
      setDigits(newDigits)
      
      // Focus last input
      const lastInput = inputRefs.current[5]
      if (lastInput) {
        lastInput.focus()
        setActiveIndex(5)
      }
      
      onComplete(paste)
    }
  }, [disabled, onComplete])

  // Handle focus
  const handleFocus = useCallback((index: number) => {
    if (!disabled) {
      setActiveIndex(index)
    }
  }, [disabled])

  // Clear all inputs
  const clearInputs = useCallback(() => {
    setDigits(['', '', '', '', '', ''])
    setActiveIndex(0)
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Handle resend
  const handleResend = useCallback(() => {
    if (onResend && countdown === 0) {
      onResend()
      setCountdown(30) // 30 second cooldown
      clearInputs()
    }
  }, [onResend, countdown, clearInputs])

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Enter SMS Code</h2>
        <p className="text-text-secondary text-sm">
          We sent a 6-digit code to{' '}
          <span className="text-electric-blue font-medium">
            {phone ? formatPhoneDisplay(phone) : 'your phone'}
          </span>
        </p>
      </div>

      {/* OTP Input Grid */}
      <div className="flex justify-center space-x-3 mb-6">
        {digits.map((digit, index) => (
          <div key={index} className="relative">
            <input
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={() => handleFocus(index)}
              disabled={disabled}
              className={`
                w-12 h-14 text-center text-xl font-bold rounded-lg transition-all duration-300
                ${disabled 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white/5 text-text-primary'
                }
                ${error 
                  ? 'border-2 border-error focus:border-error focus:ring-error/20' 
                  : activeIndex === index 
                    ? 'border-2 border-electric-blue focus:border-electric-blue focus:ring-electric-blue/20 shadow-lg shadow-electric-blue/25'
                    : digit 
                      ? 'border-2 border-success focus:border-electric-blue focus:ring-electric-blue/20'
                      : 'border border-white/10 focus:border-electric-blue focus:ring-electric-blue/20'
                }
                focus:outline-none focus:ring-4
                hover:border-electric-blue/50
                placeholder-text-secondary
              `}
              placeholder="0"
              maxLength={1}
            />
            
            {/* Loading spinner for active input */}
            {isLoading && activeIndex === index && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-error text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Resend Button */}
      {onResend && (
        <div className="text-center">
          <p className="text-text-secondary text-sm mb-3">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={countdown > 0 || isLoading}
            className={`
              text-sm font-medium transition-all duration-300
              ${countdown > 0 || isLoading
                ? 'text-text-secondary cursor-not-allowed'
                : 'text-electric-blue hover:text-electric-blue-light hover:underline'
              }
            `}
          >
            {countdown > 0 
              ? `Resend in ${countdown}s` 
              : isLoading 
                ? 'Sending...' 
                : 'Resend Code'
            }
          </button>
        </div>
      )}

      {/* Auto-paste hint */}
      <div className="text-center mt-4">
        <p className="text-text-secondary text-xs">
          💡 Tip: You can paste the 6-digit code directly
        </p>
      </div>
    </div>
  )
}

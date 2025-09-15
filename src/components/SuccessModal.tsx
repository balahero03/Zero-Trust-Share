'use client';

// import { useState } from 'react'; // Unused import

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  email?: string;
}

export function SuccessModal({ isOpen, onClose, title, message, email }: SuccessModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 animate-scale-in">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {title}
          </h2>
          <p className="text-text-secondary">
            {message}
          </p>
          {email && (
            <p className="text-sm text-electric-blue mt-2">
              Email sent to: <strong>{email}</strong>
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-text-primary mb-2">Next Steps:</h3>
          <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
            <li>Check your email inbox</li>
            <li>Click the confirmation link</li>
            <li>You&apos;ll be redirected back to AetherVault</li>
            <li>Start sharing files securely!</li>
          </ol>
        </div>

        {/* Help Text */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-400">
            <strong>Can&apos;t find the email?</strong> Check your spam folder or wait a few minutes for delivery.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

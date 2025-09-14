'use client';

import { useState } from 'react';

interface ShareResultProps {
  shareLink: string;
  passcode: string;
  onReset: () => void;
}

export function ShareResult({ shareLink, passcode, onReset }: ShareResultProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [passcodeCopied, setPasscodeCopied] = useState(false);

  const copyToClipboard = async (text: string, type: 'link' | 'passcode') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } else {
        setPasscodeCopied(true);
        setTimeout(() => setPasscodeCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 animate-slide-in-up">
      <div className="space-y-6">
        {/* Success Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">
            Your File is Secured
          </h3>
          <p className="text-text-secondary">
            Your file has been encrypted and uploaded securely. Share the link and passcode with your recipient.
          </p>
        </div>

        {/* Share Link */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary">
            Share Link
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary text-sm font-mono"
            />
            <button
              onClick={() => copyToClipboard(shareLink, 'link')}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                linkCopied
                  ? 'bg-success text-white'
                  : 'bg-electric-blue hover:bg-electric-blue-dark text-white hover:shadow-lg hover:shadow-electric-blue/25'
              }`}
            >
              {linkCopied ? (
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </div>
              ) : (
                'Copy'
              )}
            </button>
          </div>
        </div>

        {/* Passcode */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary">
            Passcode
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={passcode}
              readOnly
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary text-sm font-mono"
            />
            <button
              onClick={() => copyToClipboard(passcode, 'passcode')}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                passcodeCopied
                  ? 'bg-success text-white'
                  : 'bg-electric-blue hover:bg-electric-blue-dark text-white hover:shadow-lg hover:shadow-electric-blue/25'
              }`}
            >
              {passcodeCopied ? (
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </div>
              ) : (
                'Copy'
              )}
            </button>
          </div>
        </div>

        {/* Security Warning */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-warning font-medium mb-1">Important Security Notice</h4>
              <p className="text-warning/80 text-sm">
                Share this passcode through a separate, secure channel (e.g., phone call, text message, or encrypted messaging app). 
                Never share both the link and passcode in the same message or email.
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="border-t border-white/10 pt-6">
          <div className="text-center">
            <h4 className="text-text-primary font-medium mb-4">Quick Share with QR Code</h4>
            <div className="inline-block p-4 bg-white rounded-lg">
              {/* Placeholder QR Code - in a real app, you'd generate an actual QR code */}
              <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
            <p className="text-text-secondary text-sm mt-2">
              Recipients can scan this QR code to access the share link
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            onClick={onReset}
            className="flex-1 py-3 px-6 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25"
          >
            Share Another File
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 text-text-secondary hover:text-text-primary bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipientView } from '@/components/RecipientView';

export default function DownloadPage() {
  const router = useRouter();
  const [fileId, setFileId] = useState('');

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Access
            <span className="block text-electric-blue">
              Shared File
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Enter the file ID from the share link to access your secure file.
            <br />
            <span className="text-electric-blue font-semibold">Your data is protected with zero-knowledge encryption.</span>
          </p>
        </div>

        {/* File ID Input */}
        {!fileId && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 animate-slide-in-up">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Enter File ID
                  </h3>
                  <p className="text-text-secondary">
                    Get the file ID from the share link you received
                  </p>
                </div>

                <div>
                  <label htmlFor="fileId" className="block text-sm font-medium text-text-primary mb-2">
                    File ID
                  </label>
                  <input
                    type="text"
                    id="fileId"
                    value={fileId}
                    onChange={(e) => setFileId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                    placeholder="Enter the file ID from the share link"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setFileId(fileId)}
                    disabled={!fileId}
                    className="flex-1 py-3 px-6 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Access File
                  </button>
                  <button
                    onClick={handleBackToHome}
                    className="px-6 py-3 text-text-secondary hover:text-text-primary bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recipient View */}
        {fileId && (
          <div className="max-w-4xl mx-auto">
            <RecipientView fileId={fileId} />
          </div>
        )}

        {/* Instructions */}
        {!fileId && (
          <div className="mt-8">
            <div className="bg-slate-darker border border-white/10 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-electric-blue/10 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">How to Access Files</h3>
              <div className="space-y-3 text-text-secondary">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-electric-blue/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-electric-blue text-xs font-bold">1</span>
                  </div>
                  <p>Get the shareable link from the sender</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-electric-blue/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-electric-blue text-xs font-bold">2</span>
                  </div>
                  <p>Extract the file ID from the share link</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-electric-blue/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-electric-blue text-xs font-bold">3</span>
                  </div>
                  <p>Enter the file ID above to access the file</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-electric-blue/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-electric-blue text-xs font-bold">4</span>
                  </div>
                  <p>Enter the passcode shared through a separate channel</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        {!fileId && (
          <div className="mt-8 text-center">
            <div className="bg-slate-darker border border-white/10 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">🔒 Zero-Knowledge Decryption</h3>
              <p className="text-text-secondary">
                Your file is decrypted entirely in your browser.
                <br />
                The decryption key never leaves your device.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

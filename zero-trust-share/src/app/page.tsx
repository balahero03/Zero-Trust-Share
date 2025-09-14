'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUploadProcess } from '@/components/FileUploadProcess';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleDownloadClick = () => {
    router.push('/download');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <div className="max-w-4xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            The Only File-Sharing Platform That Combines
            <span className="block text-electric-blue mt-2">
              Zero-Knowledge Architecture
            </span>
            <span className="block text-text-secondary text-2xl md:text-3xl mt-4">
              with True Out-of-Band Authentication
            </span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Share files with confidence. Your data is encrypted in your browser before upload, 
            and every file requires a separate passcode shared through a different channel.
          </p>
        </div>

        {/* File Upload Process */}
        <div className="max-w-4xl mx-auto mb-16">
          <FileUploadProcess
            isAuthenticated={isAuthenticated}
            onAuthSuccess={handleAuthSuccess}
          />
        </div>

        {/* Download Section */}
        <div className="max-w-md mx-auto">
          <button
            onClick={handleDownloadClick}
            className="w-full py-3 px-6 text-text-primary bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm border border-white/10"
          >
            Access a Shared File
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 animate-slide-in-up group">
            <div className="w-16 h-16 bg-electric-blue/10 rounded-2xl flex items-center justify-center mb-6 animate-float group-hover:animate-pulse-glow">
              <svg className="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-4">Client-Side Encryption</h3>
            <p className="text-text-secondary">Files are encrypted in your browser before leaving your device.</p>
          </div>
          
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 animate-slide-in-up group" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mb-6 animate-float group-hover:animate-pulse-glow" style={{ animationDelay: '0.5s' }}>
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-4">Out-of-Band Authentication</h3>
            <p className="text-text-secondary">Passcodes are shared through separate channels for maximum security.</p>
          </div>
          
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 animate-slide-in-up group" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mb-6 animate-float group-hover:animate-pulse-glow" style={{ animationDelay: '1s' }}>
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-4">Burn After Reading</h3>
            <p className="text-text-secondary">Files can be set to self-destruct after being downloaded once for maximum security.</p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-4">🔒 Zero-Knowledge Architecture</h3>
            <p className="text-text-secondary text-lg">
              Your files are encrypted in your browser. The encryption key is never sent to our servers.
              <br />
              <span className="text-electric-blue font-semibold">We cannot access your files even if we wanted to.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

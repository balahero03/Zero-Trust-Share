'use client';

import { useState, useCallback, useRef } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { FileShare } from '@/components/FileShare';
import { FileDownload } from '@/components/FileDownload';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<{
    id: string;
    name: string;
    size: number;
    shareUrl: string;
    password: string;
  } | null>(null);
  const [isDownloadMode, setIsDownloadMode] = useState(false);

  const handleFileUploaded = useCallback((fileData: {
    id: string;
    name: string;
    size: number;
    shareUrl: string;
    password: string;
  }) => {
    setUploadedFile(fileData);
    setIsDownloadMode(false);
  }, []);

  const handleDownloadMode = useCallback(() => {
    setIsDownloadMode(true);
    setUploadedFile(null);
  }, []);

  const handleBackToUpload = useCallback(() => {
    setIsDownloadMode(false);
    setUploadedFile(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ZeroVault</h1>
                <p className="text-sm text-gray-300">Zero-Trust File Sharing</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              {!isDownloadMode && (
                <button
                  onClick={handleDownloadMode}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                >
                  Download File
                </button>
              )}
              {isDownloadMode && (
                <button
                  onClick={handleBackToUpload}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                >
                  Upload File
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Share Files Without
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Trusting Anyone
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your files are encrypted in your browser before upload. Even we can't see what you're sharing.
            <br />
            <span className="text-purple-400 font-semibold">Zero knowledge, maximum security.</span>
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Client-Side Encryption</h3>
            <p className="text-gray-300 text-sm">Files are encrypted in your browser using AES-256-GCM before leaving your device.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Password Protected</h3>
            <p className="text-gray-300 text-sm">Add an extra layer of security with a password that only you and the recipient know.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Burn After Reading</h3>
            <p className="text-gray-300 text-sm">Files can be set to self-destruct after being downloaded once for maximum security.</p>
          </div>
        </div>

        {/* Main Interface */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          {isDownloadMode ? (
            <FileDownload onBack={handleBackToUpload} />
          ) : uploadedFile ? (
            <FileShare 
              file={uploadedFile} 
              onUploadAnother={handleBackToUpload}
            />
          ) : (
            <FileUpload onFileUploaded={handleFileUploaded} />
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            🔒 Your files are encrypted with AES-256-GCM. The encryption key is never sent to our servers.
            <br />
            We cannot access your files even if we wanted to.
          </p>
        </div>
      </main>
    </div>
  );
}

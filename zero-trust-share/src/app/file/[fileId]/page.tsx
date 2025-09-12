'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileDownload } from '@/components/FileDownload';

export default function FileDownloadPage() {
  const params = useParams();
  const [fileId, setFileId] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Extract file ID from URL params
      const id = params.fileId as string;
      setFileId(id);

      // Extract password from URL hash
      const hash = window.location.hash;
      if (hash.startsWith('#password=')) {
        const extractedPassword = decodeURIComponent(hash.substring(10));
        setPassword(extractedPassword);
      }
    }
  }, [params.fileId]);

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
              <a
                href="/"
                className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              >
                Upload File
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Download
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Secure File
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Enter the password to decrypt and download your file.
            <br />
            <span className="text-purple-400 font-semibold">Your data is safe with us.</span>
          </p>
        </div>

        {/* Download Interface */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <FileDownload 
            onBack={() => window.location.href = '/'}
            initialFileId={fileId}
            initialPassword={password}
          />
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            🔒 Your file is decrypted entirely in your browser. The password never leaves your device.
            <br />
            We cannot access your files even if we wanted to.
          </p>
        </div>
      </main>
    </div>
  );
}


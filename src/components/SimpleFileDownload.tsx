'use client';

import { useState, useEffect } from 'react';
import { decryptFile } from '@/lib/encryption';
import { downloadFile, getFileMetadata, recordDownload } from '@/lib/storage';

interface SimpleFileDownloadProps {
  onBack: () => void;
  initialFileId?: string;
  initialKey?: string;
}

type DownloadStep = 'password' | 'downloading' | 'success' | 'error';

interface FileInfo {
  fileSize: number;
  fileSalt: number[];
  fileIv: number[];
  burnAfterRead: boolean;
  downloadCount: number;
}

export function SimpleFileDownload({ onBack, initialFileId, initialKey }: SimpleFileDownloadProps) {
  const [fileId, setFileId] = useState(initialFileId || '');
  const [password, setPassword] = useState('');
  const [currentStep, setCurrentStep] = useState<DownloadStep>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [downloadedFileName, setDownloadedFileName] = useState('');

  // Auto-detect file ID from URL and auto-download if we have the key
  useEffect(() => {
    if (initialFileId) {
      setFileId(initialFileId);
      // If we have a key from URL hash, auto-download
      if (initialKey) {
        handleDownloadWithKey();
      }
    }
  }, [initialFileId, initialKey]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePasswordSubmit = async () => {
    if (!fileId.trim()) {
      setError('Please enter a valid file ID');
      return;
    }

    if (!password.trim()) {
      setError('Please enter the password');
      return;
    }

    setIsLoading(true);
    setError('');
    setCurrentStep('downloading');
    setDownloadProgress(0);

    try {
      // Step 1: Get file metadata
      setDownloadProgress(20);
      const metadata = await getFileMetadata(fileId);
      setFileInfo(metadata);

      // Step 2: Download encrypted file
      setDownloadProgress(40);
      const encryptedData = await downloadFile(fileId);

      // Step 3: Decrypt file using password
      setDownloadProgress(70);
      const decryptedBlob = await decryptFile(
        encryptedData,
        password,
        new Uint8Array(metadata.fileSalt),
        new Uint8Array(metadata.fileIv)
      );

      // Step 4: Trigger download
      setDownloadProgress(90);
      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `secure-file-${fileId}`;
      setDownloadedFileName(a.download);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Step 5: Record download
      await recordDownload(fileId);

      setDownloadProgress(100);
      setCurrentStep('success');

    } catch (err) {
      console.error('Download failed:', err);
      setError(err instanceof Error ? err.message : 'Download failed. Please check your password and try again.');
      setCurrentStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadWithKey = async () => {
    if (!initialFileId || !initialKey) return;

    setCurrentStep('downloading');
    setDownloadProgress(0);
    setIsLoading(true);

    try {
      // Step 1: Get file metadata
      setDownloadProgress(20);
      const metadata = await getFileMetadata(initialFileId);
      setFileInfo(metadata);

      // Step 2: Download encrypted file
      setDownloadProgress(40);
      const encryptedData = await downloadFile(initialFileId);

      // Step 3: Decrypt file using key from URL
      setDownloadProgress(70);
      const decryptedBlob = await decryptFile(
        encryptedData,
        initialKey,
        new Uint8Array(metadata.fileSalt),
        new Uint8Array(metadata.fileIv)
      );

      // Step 4: Trigger download
      setDownloadProgress(90);
      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `secure-file-${initialFileId}`;
      setDownloadedFileName(a.download);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Step 5: Record download
      await recordDownload(initialFileId);

      setDownloadProgress(100);
      setCurrentStep('success');

    } catch (err) {
      console.error('Download failed:', err);
      setError(err instanceof Error ? err.message : 'Download failed. The file may have expired or the link may be invalid.');
      setCurrentStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setCurrentStep('password');
    setError('');
    setDownloadProgress(0);
    setPassword('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      
      {/* Step 1: Password Input */}
      {currentStep === 'password' && (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Secure File Download</h1>
            <p className="text-gray-300">Enter the password to access your secure file</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* File ID Display (read-only) */}
            {fileId && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  File ID
                </label>
                <input
                  type="text"
                  value={fileId}
                  readOnly
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">File ID automatically detected from share link</p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the password provided by the sender"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handlePasswordSubmit()}
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handlePasswordSubmit}
              disabled={isLoading || !fileId.trim() || !password.trim()}
              className="w-full py-3 px-4 bg-electric-blue hover:bg-electric-blue-dark disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Preparing Download...</span>
                </div>
              ) : (
                'Download File'
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-electric-blue/10 border border-electric-blue/20 rounded-lg p-4">
            <p className="text-electric-blue text-sm text-center">
              🔒 Your file will be decrypted locally in your browser for maximum security
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Downloading */}
      {currentStep === 'downloading' && (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 text-center">
          {/* Loading Animation */}
          <div className="w-20 h-20 mx-auto mb-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-electric-blue/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Decrypting Your File</h2>
          <p className="text-gray-300 mb-6">
            Please wait while we securely decrypt and prepare your download...
          </p>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-gray-300">
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

          {fileInfo && (
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                File Size: {formatFileSize(fileInfo.fileSize)}
              </p>
              {fileInfo.burnAfterRead && (
                <p className="text-sm text-yellow-400 mt-2">
                  ⚠️ This file will be deleted after download
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Success */}
      {currentStep === 'success' && (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-green-400 mb-2">Download Complete!</h2>
          <p className="text-gray-300 mb-6">
            Your file has been successfully downloaded and decrypted.
          </p>

          {fileInfo && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-green-400 font-medium text-sm">{downloadedFileName}</p>
                  <p className="text-green-400 text-xs">{formatFileSize(fileInfo.fileSize)}</p>
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

      {/* Step 4: Error */}
      {currentStep === 'error' && (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-red-400 mb-2">Download Failed</h2>
          <p className="text-gray-300 mb-6">{error}</p>

          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="w-full py-3 px-4 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300"
            >
              Try Again
            </button>
            
            <button
              onClick={onBack}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

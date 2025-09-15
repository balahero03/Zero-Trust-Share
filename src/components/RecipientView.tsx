'use client';

import { useState, useEffect } from 'react';
import { getFileMetadata, downloadFile, recordDownload } from '@/lib/storage';
import { decryptFile } from '@/lib/encryption';

interface RecipientViewProps {
  fileId: string;
}

interface FileMetadata {
  fileSize: number;
  fileSalt: Uint8Array;
  fileIv: number[];
  burnAfterRead: boolean;
  downloadCount: number;
}

export function RecipientView({ fileId }: RecipientViewProps) {
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [fileContent, setFileContent] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState<string>('');

  // Load file metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const metadata = await getFileMetadata(fileId);
        setFileMetadata(metadata);
      } catch (error) {
        console.error('Failed to load file metadata:', error);
        setError('File not found or has expired');
      }
    };

    loadMetadata();
  }, [fileId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    return (
      <svg className="w-16 h-16 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode || !fileMetadata) return;

    setIsLoading(true);
    setError('');

    try {
      // Download encrypted file
      const encryptedData = await downloadFile(fileId);
      
      // Decrypt file using passcode and salt
      const decryptedBlob = await decryptFile(
        encryptedData,
        passcode,
        fileMetadata.fileSalt,
        new Uint8Array(fileMetadata.fileIv)
      );

      setFileContent(decryptedBlob);
      setFileName(`secure-file-${fileId}.bin`);
      setIsUnlocked(true);

      // Record download for burn-after-read functionality
      await recordDownload(fileId);

    } catch (err) {
      console.error('Decryption failed:', err);
      setError('Invalid passcode or file corrupted. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!fileContent) return;
    
    const url = URL.createObjectURL(fileContent);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!fileMetadata && !error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-electric-blue/10 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Loading File Information
          </h3>
          <p className="text-text-secondary">
            Please wait while we retrieve the file details...
          </p>
        </div>
      </div>
    );
  }

  if (error && !fileMetadata) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            File Not Available
          </h3>
          <p className="text-text-secondary">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (isUnlocked && fileContent) {
    return (
      <div className="w-full max-w-4xl mx-auto">
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
                File Unlocked Successfully
              </h3>
              <p className="text-text-secondary">
                Your file is ready to download
              </p>
            </div>

            {/* File Info */}
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
              {getFileIcon()}
              <div>
                <h4 className="text-lg font-semibold text-text-primary">{fileName}</h4>
                <p className="text-text-secondary">
                  {formatFileSize(fileMetadata?.fileSize || 0)}
                </p>
              </div>
            </div>

            {/* Download Button */}
            <div className="text-center">
              <button
                onClick={handleDownload}
                className="py-3 px-8 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25"
              >
                Download File
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-success font-medium mb-1">File Successfully Decrypted</h4>
                  <p className="text-success/80 text-sm">
                    Your file has been decrypted using zero-knowledge encryption. The original encrypted data remains secure on our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 animate-slide-in-up">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-electric-blue/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              Secure File Access
            </h3>
            <p className="text-text-secondary">
              Enter the passcode to unlock and access this file
            </p>
          </div>

          {/* File Info */}
          {fileMetadata && (
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
              {getFileIcon()}
              <div>
                <h4 className="text-lg font-semibold text-text-primary">Encrypted File</h4>
                <p className="text-text-secondary">
                  {formatFileSize(fileMetadata.fileSize)}
                  {fileMetadata.burnAfterRead && (
                    <span className="ml-2 text-warning">• Burn after read</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Passcode Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-text-primary mb-2">
                Passcode
              </label>
              <input
                type="password"
                id="passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                placeholder="Enter the passcode"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !passcode}
              className="w-full py-3 px-6 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Decrypting...</span>
                </div>
              ) : (
                'Unlock & Access File'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-warning font-medium mb-1">Zero-Knowledge Security</h4>
                <p className="text-warning/80 text-sm">
                  This file is protected with end-to-end encryption. Only you and the person who shared it can access the contents. Our servers never see your data unencrypted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { decryptFile } from '@/lib/encryption';
import { downloadFile } from '@/lib/storage';

interface FileDownloadProps {
  onBack: () => void;
  initialFileId?: string;
  initialKey?: string;
}

export function FileDownload({ onBack, initialFileId, initialKey }: FileDownloadProps) {
  const [fileId, setFileId] = useState(initialFileId || '');
  const [key, setKey] = useState(initialKey || '');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
  } | null>(null);

  // Extract file ID and key from URL if present (fallback)
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialFileId && !initialKey) {
      // const urlParams = new URLSearchParams(window.location.search); // Unused variable
      const hash = window.location.hash;
      
      // Extract file ID from URL path
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length > 2 && pathParts[1] === 'file') {
        setFileId(pathParts[2]);
      }
      
      // Extract key from hash
      if (hash.startsWith('#key=')) {
        const extractedKey = decodeURIComponent(hash.substring(5));
        setKey(extractedKey);
      }
    }
  }, [initialFileId, initialKey]);

  const handleDownload = async () => {
    if (!fileId.trim()) {
      setError('Please enter a file ID');
      return;
    }

    if (!key.trim()) {
      setError('Please enter the decryption key');
      return;
    }

    setIsDownloading(true);
    setError('');
    setDownloadProgress(0);

    try {
      // Step 1: Get file metadata
      setDownloadProgress(10);
      const metadata = await fetch(`/api/file/${fileId}/metadata`).then(res => {
        if (!res.ok) throw new Error('File not found or expired');
        return res.json();
      });

      setFileInfo({
        name: metadata.originalName,
        size: metadata.originalSize
      });

      // Step 2: Download encrypted file
      setDownloadProgress(30);
      const encryptedData = await downloadFile(fileId);

      // Step 3: Decrypt file
      setDownloadProgress(70);
      const decryptedBlob = await decryptFile(
        encryptedData,
        key,
        new Uint8Array(metadata.iv)
      );

      // Step 4: Download file
      setDownloadProgress(90);
      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = metadata.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadProgress(100);

      // Step 5: Handle burn after read
      if (metadata.burnAfterRead) {
        setDownloadProgress(95);
        try {
          await fetch(`/api/file/${fileId}`, { method: 'DELETE' });
          setDownloadProgress(100);
          
          // Show burn animation
          setTimeout(() => {
            setError('🔥 File has been deleted after download (burn after read)');
            // Add burn effect to the UI
            const burnEffect = document.createElement('div');
            burnEffect.className = 'fixed inset-0 pointer-events-none z-50';
            burnEffect.innerHTML = `
              <div class="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 animate-pulse"></div>
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl animate-bounce">🔥</div>
            `;
            document.body.appendChild(burnEffect);
            
            // Remove burn effect after animation
            setTimeout(() => {
              document.body.removeChild(burnEffect);
            }, 3000);
          }, 1000);
        } catch (error) {
          console.error('Failed to delete file after download:', error);
        }
      }

    } catch (error: unknown) {
      console.error('Download failed:', error);
      setError(error instanceof Error ? error.message : 'Download failed. Please check your file ID and decryption key.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Download Secure File</h3>
        <p className="text-gray-300">Enter the file ID and password to decrypt and download</p>
      </div>

      {/* File ID Input */}
      <div className="space-y-2">
        <label htmlFor="fileId" className="block text-sm font-medium text-white">
          File ID
        </label>
        <input
          id="fileId"
          type="text"
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
          placeholder="Enter the file ID from the share link"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent font-mono"
          disabled={isDownloading}
        />
      </div>

      {/* Decryption Key Input */}
      <div className="space-y-2">
        <label htmlFor="key" className="block text-sm font-medium text-white">
          Decryption Key
        </label>
        <input
          id="key"
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter the decryption key from the shareable link"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent font-mono text-sm"
          disabled={isDownloading}
        />
      </div>

      {/* File Info Display */}
      {fileInfo && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-medium">{fileInfo.name}</h4>
              <p className="text-sm text-gray-300">{formatFileSize(fileInfo.size)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
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

      {/* Download Progress */}
      {isDownloading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-white">
            <span>Decrypting and downloading...</span>
            <span>{downloadProgress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-electric-blue to-electric-blue-light h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading || !fileId.trim() || !key.trim()}
        className="w-full px-6 py-4 bg-gradient-to-r from-electric-blue to-electric-blue-light hover:from-electric-blue-dark hover:to-electric-blue disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
      >
        {isDownloading ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Decrypting...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download File</span>
          </div>
        )}
      </button>

      {/* Security Notice */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-400 mb-1">Decryption Process</h4>
            <p className="text-sm text-gray-300">
              Your file is decrypted entirely in your browser. The decryption key never leaves your device.
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
      >
        Back to Upload
      </button>
    </div>
  );
}

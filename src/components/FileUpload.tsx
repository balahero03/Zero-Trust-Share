'use client';

import { useState, useCallback, useRef } from 'react';
import { encryptFile } from '@/lib/encryption';
import { uploadFileData, prepareFileUpload } from '@/lib/storage';

// Convert Uint8Array to base64
function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  return btoa(String.fromCharCode(...uint8Array));
}

interface FileUploadProps {
  onFileUploaded: (fileData: {
    id: string;
    name: string;
    size: number;
    shareUrl: string;
    password: string;
  }) => void;
}

export function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [expiryHours, setExpiryHours] = useState(24);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setShowPasswordInput(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handlePasswordSubmit = useCallback(async () => {
    if (!selectedFile || !password.trim()) return;
    
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Encrypt the file
      setUploadProgress(10);
      const { encryptedData, iv, fileSalt } = await encryptFile(selectedFile, password);
      
      // Step 2: Prepare upload (get upload URL and create database record)
      setUploadProgress(30);
      const uploadResponse = await prepareFileUpload(
        selectedFile.name, // This should be encrypted filename, but for now using original
        encryptedData.byteLength,
        fileSalt,
        iv,
        'demo-master-key-hash', // Placeholder - in real app this would be derived
        'demo-metadata-iv', // Placeholder - in real app this would be derived
        burnAfterRead,
        expiryHours
      );

      // Step 3: Upload file data to Supabase Storage
      setUploadProgress(60);
      await uploadFileData(uploadResponse.fileName, encryptedData);

      setUploadProgress(90);

      // Step 4: Generate share URL for recipients
      const shareUrl = `${window.location.origin}/share/${uploadResponse.fileId}`;
      
      setUploadProgress(100);

      // Notify parent component
      onFileUploaded({
        id: uploadResponse.fileId,
        name: selectedFile.name,
        size: selectedFile.size,
        shareUrl,
        password: password // Using the actual password
      });

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setShowPasswordInput(false);
      setPassword('');
      setSelectedFile(null);
    }
  }, [selectedFile, password, burnAfterRead, expiryHours, onFileUploaded]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-text-primary mb-2">Upload Your File</h3>
        <p className="text-text-secondary">Choose a file to share securely with automatic encryption</p>
      </div>

      {/* Encryption Notice */}
      <div className="bg-electric-blue/10 border border-electric-blue/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-electric-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-electric-blue mb-1">Password-Protected Encryption</h4>
            <p className="text-sm text-text-secondary">
              Your file will be encrypted with a password you choose. Recipients will need this password to download and decrypt the file.
            </p>
          </div>
        </div>
      </div>

      {/* Security Options */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
          <input
            id="burnAfterRead"
            type="checkbox"
            checked={burnAfterRead}
            onChange={(e) => setBurnAfterRead(e.target.checked)}
            className="w-4 h-4 text-electric-blue bg-white/10 border-white/20 rounded focus:ring-electric-blue"
            disabled={isUploading}
          />
          <label htmlFor="burnAfterRead" className="text-sm text-text-primary">
            Burn after reading (delete after first download)
          </label>
        </div>

        <div className="space-y-2">
          <label htmlFor="expiry" className="block text-sm font-medium text-text-primary">
            Link expires in
          </label>
          <select
            id="expiry"
            value={expiryHours}
            onChange={(e) => setExpiryHours(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-electric-blue"
            disabled={isUploading}
          >
            <option value={1}>1 hour</option>
            <option value={6}>6 hours</option>
            <option value={24}>24 hours</option>
            <option value={72}>3 days</option>
            <option value={168}>1 week</option>
          </select>
        </div>
      </div>

      {/* File Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragOver
            ? 'border-electric-blue bg-electric-blue/10'
            : 'border-white/30 hover:border-electric-blue/50'
        } ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-electric-blue to-electric-blue-light rounded-full flex items-center justify-center animate-pulse-glow">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-text-primary font-medium">Encrypting and uploading...</p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-electric-blue to-electric-blue-light h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-text-secondary">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-electric-blue to-electric-blue-light rounded-full flex items-center justify-center animate-float">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-medium text-text-primary mb-2">
                Drop your file here or click to browse
              </p>
              <p className="text-text-secondary">
                Maximum file size: 100MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Password Input */}
      {showPasswordInput && selectedFile && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-2">Set Password for File</h4>
              <p className="text-gray-300 text-sm">
                Choose a password to protect your file. Recipients will need this password to download.
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="filePassword" className="block text-sm font-medium text-white mb-2">
                  File Password
                </label>
                <input
                  id="filePassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a secure password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                  onKeyPress={(e) => e.key === 'Enter' && password.trim() && handlePasswordSubmit()}
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!password.trim() || isUploading}
                  className="flex-1 py-3 px-4 bg-electric-blue hover:bg-electric-blue-dark disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300"
                >
                  {isUploading ? 'Uploading...' : 'Upload & Encrypt'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordInput(false);
                    setSelectedFile(null);
                    setPassword('');
                  }}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-electric-blue/10 border border-electric-blue/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-electric-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-electric-blue mb-1">Security Notice</h4>
            <p className="text-sm text-text-secondary">
              Your file will be encrypted with a unique key generated in your browser. The encryption key is never sent to our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

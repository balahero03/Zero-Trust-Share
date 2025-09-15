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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Encrypt the file
      setUploadProgress(10);
      const { encryptedData, iv, fileSalt } = await encryptFile(file, 'default-passcode');
      
      // Step 2: Prepare upload (get upload URL and create database record)
      setUploadProgress(30);
      const uploadResponse = await prepareFileUpload(
        file.name, // This should be encrypted filename, but for now using original
        encryptedData.byteLength,
        iv,
        burnAfterRead,
        expiryHours
      );

      // Step 3: Upload file data to S3
      setUploadProgress(60);
      await uploadFileData(uploadResponse.uploadUrl, encryptedData);

      setUploadProgress(90);

      // Step 4: Generate share URL with file salt
      const shareUrl = `${window.location.origin}/file/${uploadResponse.fileId}#salt=${encodeURIComponent(uint8ArrayToBase64(fileSalt))}`;
      
      setUploadProgress(100);

      // Notify parent component
      onFileUploaded({
        id: uploadResponse.fileId,
        name: file.name,
        size: file.size,
        shareUrl,
        password: 'default-passcode' // Using the passcode for compatibility
      });

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [burnAfterRead, expiryHours, onFileUploaded]);

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
            <h4 className="text-sm font-medium text-electric-blue mb-1">Automatic Encryption</h4>
            <p className="text-sm text-text-secondary">
              Your file will be automatically encrypted with a unique key. The encryption key will be included in the shareable link.
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

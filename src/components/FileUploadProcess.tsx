'use client';

import { useState, useRef, useCallback } from 'react';
import { AuthModal } from './AuthModal';
// import { ShareResult } from './ShareResult'; // No longer used
import { ShareSuccessModal } from './ShareSuccessModal';
import { supabase } from '@/lib/supabase';
import { encryptFile, encryptMetadata, deriveMasterKey } from '@/lib/encryption';
import { prepareFileUpload, uploadFileData } from '@/lib/storage';
import { initializeMasterKey, getMasterKeySalt } from '@/lib/auth-utils';

type UploadState = 'idle' | 'auth-gated' | 'config' | 'processing' | 'success';

interface FileUploadProcessProps {
  isAuthenticated: boolean;
  onAuthSuccess: () => void;
}

interface ProcessingStep {
  id: string;
  label: string;
  completed: boolean;
}

export function FileUploadProcess({ onAuthSuccess }: FileUploadProcessProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [passcode, setPasscode] = useState('');
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [linkExpiry, setLinkExpiry] = useState('24h');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 'encrypt', label: 'Encrypting file...', completed: false },
    { id: 'metadata', label: 'Encrypting metadata...', completed: false },
    { id: 'upload', label: 'Uploading to secure storage...', completed: false },
    { id: 'finalize', label: 'Finalizing...', completed: false },
  ]);
  const [shareData, setShareData] = useState<{ link: string; passcode: string } | null>(null);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    
    // Always check authentication status from Supabase
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setState('auth-gated');
          setShowAuthModal(true);
        } else {
          // Initialize master key if not already done
          await initializeMasterKey();
          setState('config');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setState('auth-gated');
        setShowAuthModal(true);
      }
    };
    
    checkAuth();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleAuthSuccess = () => {
    onAuthSuccess();
    setShowAuthModal(false);
    setState('config');
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setState('idle');
    setSelectedFile(null);
  };

  const handleEncryptAndGenerate = async () => {
    if (!selectedFile || !passcode) return;

    setState('processing');
    
    try {
      // Step 1: Encrypt the file
      setProcessingSteps(prev => 
        prev.map((step, index) => 
          index === 0 ? { ...step, completed: true } : step
        )
      );
      
      const { encryptedData, fileSalt, iv } = await encryptFile(selectedFile, passcode);

      // Step 2: Encrypt metadata (filename) with master key
      setProcessingSteps(prev => 
        prev.map((step, index) => 
          index === 1 ? { ...step, completed: true } : step
        )
      );

      // Get master key from session storage
      const masterKeySalt = getMasterKeySalt();

      // For demo purposes, we'll use a placeholder password
      // In production, you'd store the master key more securely
      const { masterKey } = await deriveMasterKey('demo-password', masterKeySalt);
      
      const { encryptedData: encryptedFileName } = await encryptMetadata(selectedFile.name, masterKey);

      // Step 3: Prepare upload and upload to Supabase Storage
      setProcessingSteps(prev => 
        prev.map((step, index) => 
          index === 2 ? { ...step, completed: true } : step
        )
      );

      const expiryHours = linkExpiry === '1h' ? 1 : 
                         linkExpiry === '24h' ? 24 : 
                         linkExpiry === '7d' ? 168 : 720;

      const { fileName, fileId } = await prepareFileUpload(
        encryptedFileName,
        selectedFile.size,
        fileSalt,
        iv,
        burnAfterRead,
        expiryHours
      );

      await uploadFileData(fileName, encryptedData);

      // Step 4: Finalize
      setProcessingSteps(prev => 
        prev.map((step, index) => 
          index === 3 ? { ...step, completed: true } : step
        )
      );

      // Generate share link
      const shareLink = `${window.location.origin}/share/${fileId}`;
      setShareData({ link: shareLink, passcode });
      setState('success');

    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setState('config');
    }
  };

  const handleReset = () => {
    setState('idle');
    setSelectedFile(null);
    setPasscode('');
    setBurnAfterRead(false);
    setLinkExpiry('24h');
    setProcessingSteps(prev => prev.map(step => ({ ...step, completed: false })));
    setShareData(null);
    setError('');
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) {
      return (
        <svg className="w-12 h-12 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (type.includes('pdf')) {
      return (
        <svg className="w-12 h-12 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-12 h-12 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
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
    <div className="w-full max-w-4xl mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        className="hidden"
        accept="*/*"
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={handleCloseAuthModal}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Idle State - Drag & Drop Zone */}
      {state === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-white/20 rounded-2xl p-16 text-center hover:border-electric-blue/50 transition-all duration-300 cursor-pointer group"
          onClick={handleBrowseClick}
        >
          <div className="space-y-6">
            <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center group-hover:bg-electric-blue/10 transition-all duration-300">
              <svg className="w-12 h-12 text-text-secondary group-hover:text-electric-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                Drag & Drop Your File to Begin
              </h3>
              <p className="text-text-secondary mb-4">
                Or click to browse your files
              </p>
              <button className="text-electric-blue hover:text-electric-blue-light font-medium transition-colors">
                Browse Files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration State */}
      {state === 'config' && selectedFile && (
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 animate-slide-in-up">
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
              {getFileIcon(selectedFile)}
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{selectedFile.name}</h3>
                <p className="text-text-secondary">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>

            {/* Passcode Input */}
            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-text-primary mb-2">
                Create a Secure Passcode
              </label>
              <input
                type="password"
                id="passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                placeholder="Enter a secure passcode"
                required
              />
              <p className="text-xs text-text-secondary mt-1">
                This passcode will be required to access the file
              </p>
            </div>

            {/* Policy Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Burn After Read */}
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                <input
                  type="checkbox"
                  id="burnAfterRead"
                  checked={burnAfterRead}
                  onChange={(e) => setBurnAfterRead(e.target.checked)}
                  className="w-4 h-4 text-electric-blue bg-white/5 border-white/10 rounded focus:ring-electric-blue focus:ring-2"
                />
                <label htmlFor="burnAfterRead" className="text-text-primary font-medium">
                  Burn After Read
                </label>
              </div>

              {/* Link Expiry */}
              <div>
                <label htmlFor="linkExpiry" className="block text-sm font-medium text-text-primary mb-2">
                  Link Expiry
                </label>
                <select
                  id="linkExpiry"
                  value={linkExpiry}
                  onChange={(e) => setLinkExpiry(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                >
                  <option value="1h">1 Hour</option>
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleEncryptAndGenerate}
                disabled={!passcode}
                className="flex-1 py-3 px-6 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Encrypt & Generate Link
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 text-text-secondary hover:text-text-primary bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {state === 'processing' && (
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 animate-slide-in-up">
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-electric-blue/10 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Securing Your File
              </h3>
              <p className="text-text-secondary">
                Please wait while we encrypt and upload your file...
              </p>
            </div>

            {/* Processing Steps */}
            <div className="space-y-3">
              {processingSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-success text-white' 
                      : index === processingSteps.findIndex(s => !s.completed)
                      ? 'bg-electric-blue text-white animate-pulse'
                      : 'bg-white/10 text-text-secondary'
                  }`}>
                    {step.completed ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                    )}
                  </div>
                  <span className={`text-sm ${
                    step.completed ? 'text-success' : 
                    index === processingSteps.findIndex(s => !s.completed) ? 'text-electric-blue' : 
                    'text-text-secondary'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {state === 'success' && shareData && selectedFile && (
        <ShareSuccessModal
          isOpen={true}
          onClose={handleReset}
          fileId={shareData.link.split('/file/')[1]?.split('#')[0] || ''}
          fileName={selectedFile.name}
          shareUrl={shareData.link}
          fileSize={selectedFile.size}
        />
      )}
    </div>
  );
}

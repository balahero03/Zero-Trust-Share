'use client';

import { useState, useEffect } from 'react';

interface RecipientViewProps {
  fileId: string;
}

interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  isPreviewable: boolean;
}

export function RecipientView({ fileId }: RecipientViewProps) {
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);

  // Mock file metadata - in a real app, this would come from an API
  useEffect(() => {
    const mockMetadata: FileMetadata = {
      id: fileId,
      name: 'confidential-report.pdf',
      size: 2048576,
      type: 'application/pdf',
      uploadedAt: '2024-01-15T10:30:00Z',
      isPreviewable: true,
    };
    setFileMetadata(mockMetadata);
  }, [fileId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return (
        <svg className="w-16 h-16 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (type.includes('pdf')) {
      return (
        <svg className="w-16 h-16 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-16 h-16 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call to verify passcode and decrypt file
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, always succeed with correct passcode
      if (passcode.length >= 4) {
        setIsUnlocked(true);
        
        // If file is previewable, load content
        if (fileMetadata?.isPreviewable) {
          // Mock file content - in a real app, this would be the decrypted file data
          setFileContent('data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDYgMCBSCj4+Cj4+Ci9Db250ZW50cyA3IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCjcgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyMCBUZAooSGVsbG8gV29ybGQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKOCAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcKPj4KZW5kb2JqCjkgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iagoxMCAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcKPj4KZW5kb2JqCjExIDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZwo+PgplbmRvYmoKMTIgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iagoxMyAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcKPj4KZW5kb2JqCjE0IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZwo+PgplbmRvYmoKMTUgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iagoxNiAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcKPj4KZW5kb2JqCjE3IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZwo+PgplbmRvYmoKMTggMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iagoxOSAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcKPj4KZW5kb2JqCjIwIDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZwo+PgplbmRvYmoKMSAwIG9iago8PAovVHlwZSAvUGFnZXMKL0NvdW50IDEKL0tpZHMgWzMgMCBSXQo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMSAwIFIKPj4KZW5kb2JqCnhyZWYKMCAyMQowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDAwOSAwMDAwMCBuCjAwMDAwMDAwNTggMDAwMDAgbgowMDAwMDAwMTE1IDAwMDAwIG4KMDAwMDAwMDE2OCAwMDAwMCBuCjAwMDAwMDAyMzMgMDAwMDAgbgowMDAwMDAwMzA4IDAwMDAwIG4KMDAwMDAwMDM3MyAwMDAwMCBuCjAwMDAwMDA0MzggMDAwMDAgbgowMDAwMDAwNTAzIDAwMDAwIG4KMDAwMDAwMDU2OCAwMDAwMCBuCjAwMDAwMDA2MzMgMDAwMDAgbgowMDAwMDAwNjk4IDAwMDAwIG4KMDAwMDAwMDc2MyAwMDAwMCBuCjAwMDAwMDA4MjggMDAwMDAgbgowMDAwMDAwODkzIDAwMDAwIG4KMDAwMDAwMDk1OCAwMDAwMCBuCjAwMDAwMDEwMjMgMDAwMDAgbgowMDAwMDAxMDg4IDAwMDAwIG4KMDAwMDAwMTE1MyAwMDAwMCBuCjAwMDAwMDEyMTggMDAwMDAgbgowMDAwMDAxMjgzIDAwMDAwIG4KMDAwMDAwMTM0OCAwMDAwMCBuCjAwMDAwMDE0MTMgMDAwMDAgbgowMDAwMDAxNDc4IDAwMDAwIG4KdHJhaWxlcgo8PAovU2l6ZSAyMQovUm9vdCAyIDAgUgo+PgpzdGFydHhyZWYKMTU5NQolJUVPRgo=');
        }
      } else {
        setError('Invalid passcode. Please try again.');
      }
    } catch (err) {
      setError('Failed to unlock file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    // In a real app, this would trigger the actual file download
    const link = document.createElement('a');
    link.href = fileContent || '#';
    link.download = fileMetadata?.name || 'file';
    link.click();
  };

  if (!fileMetadata) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            File Not Found
          </h3>
          <p className="text-text-secondary">
            The file you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (isUnlocked) {
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
                Your file is ready to view or download
              </p>
            </div>

            {/* File Info */}
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
              {getFileIcon(fileMetadata.type)}
              <div>
                <h4 className="text-lg font-semibold text-text-primary">{fileMetadata.name}</h4>
                <p className="text-text-secondary">
                  {formatFileSize(fileMetadata.size)} • Uploaded {formatDate(fileMetadata.uploadedAt)}
                </p>
              </div>
            </div>

            {/* File Preview or Download */}
            {fileMetadata.isPreviewable && fileContent ? (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-text-primary">File Preview</h4>
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <iframe
                    src={fileContent}
                    className="w-full h-96"
                    title="File Preview"
                  />
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full py-3 px-6 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25"
                >
                  Download File
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleDownload}
                  className="py-3 px-8 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25"
                >
                  Download File
                </button>
              </div>
            )}
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
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
            {getFileIcon(fileMetadata.type)}
            <div>
              <h4 className="text-lg font-semibold text-text-primary">{fileMetadata.name}</h4>
              <p className="text-text-secondary">
                {formatFileSize(fileMetadata.size)} • Uploaded {formatDate(fileMetadata.uploadedAt)}
              </p>
            </div>
          </div>

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
                  <span>Unlocking...</span>
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
                <h4 className="text-warning font-medium mb-1">Security Notice</h4>
                <p className="text-warning/80 text-sm">
                  This file is protected with end-to-end encryption. Only you and the person who shared it can access the contents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

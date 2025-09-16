'use client';

import { useState, useEffect } from 'react';
import { getUserFiles, revokeFile } from '@/lib/storage';
import { deriveMasterKey, decryptMetadata } from '@/lib/encryption';
import { initializeMasterKey, getMasterKeySalt } from '@/lib/auth-utils';

interface SharedFile {
  id: string;
  encrypted_file_name: string;
  file_size: number;
  expires_at: string | null;
  burn_after_read: boolean;
  download_count: number;
  created_at: string;
  metadata_iv: string;
  master_key_hash: string;
  decryptedName?: string;
}

interface DashboardViewProps {
  // In a real app, this would come from props or context
  [key: string]: unknown;
}

export function DashboardView({}: DashboardViewProps) {
  const [showRevokeModal, setShowRevokeModal] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load user's files
  useEffect(() => {
    const loadFiles = async () => {
      try {
        setIsLoading(true);
        const files = await getUserFiles();
        
        // Initialize master key if not already done
        await initializeMasterKey();
        
        // Get master key salt for decryption
        const masterKeySalt = getMasterKeySalt();
        
        // For demo purposes, we'll use a placeholder password
        // In production, you'd store the master key more securely
        const { masterKey } = await deriveMasterKey('demo-password', masterKeySalt);
        
        const decryptedFiles = await Promise.all(
          files.map(async (file) => {
            try {
              // Decrypt the filename using the master key and metadata IV
              const decryptedName = await decryptMetadata(
                file.encrypted_file_name,
                masterKey,
                file.metadata_iv
              );
              return {
                ...file,
                decryptedName
              };
            } catch (error) {
              console.error('Failed to decrypt filename:', error);
              return {
                ...file,
                decryptedName: `Encrypted File ${file.id.slice(0, 8)}`
              };
            }
          })
        );
        
        setSharedFiles(decryptedFiles);
      } catch (error) {
        console.error('Failed to load files:', error);
        setError('Failed to load your files');
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, []);

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileStatus = (file: SharedFile) => {
    if (file.burn_after_read && file.download_count > 0) {
      return 'burned';
    }
    if (file.expires_at && new Date(file.expires_at) < new Date()) {
      return 'expired';
    }
    return 'active';
  };

  const getStatusBadge = (file: SharedFile) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    const status = getFileStatus(file);
    
    switch (status) {
      case 'active':
        return `${baseClasses} bg-success/10 text-success border border-success/20`;
      case 'expired':
        return `${baseClasses} bg-warning/10 text-warning border border-warning/20`;
      case 'burned':
        return `${baseClasses} bg-error/10 text-error border border-error/20`;
      default:
        return `${baseClasses} bg-white/10 text-text-secondary`;
    }
  };

  const handleRevoke = async (fileId: string) => {
    setIsRevoking(true);
    
    try {
      await revokeFile(fileId);
      
      // Remove from local state
      setSharedFiles(prev => prev.filter(file => file.id !== fileId));
      setShowRevokeModal(null);
    } catch (error) {
      console.error('Failed to revoke file:', error);
      setError('Failed to revoke file access');
    } finally {
      setIsRevoking(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-electric-blue/10 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Loading Your Files
          </h3>
          <p className="text-text-secondary">
            Please wait while we retrieve your shared files...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Failed to Load Files
          </h3>
          <p className="text-text-secondary mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-electric-blue hover:bg-electric-blue-dark text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">My Shares</h1>
        <p className="text-text-secondary">
          Manage your shared files and monitor their access
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-darker border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Shares</p>
              <p className="text-2xl font-bold text-text-primary">{sharedFiles.length}</p>
            </div>
            <div className="w-12 h-12 bg-electric-blue/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-darker border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Active Shares</p>
              <p className="text-2xl font-bold text-success">
                {sharedFiles.filter(f => getFileStatus(f) === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-darker border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Downloads</p>
              <p className="text-2xl font-bold text-electric-blue">
                {sharedFiles.reduce((sum, file) => sum + file.download_count, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-electric-blue/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-slate-darker border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Date Shared
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sharedFiles.map((file) => (
                <tr key={file.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{file.decryptedName}</div>
                        <div className="text-sm text-text-secondary">{formatFileSize(file.file_size)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {formatDate(file.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={getStatusBadge(file)}>
                      {getFileStatus(file).charAt(0).toUpperCase() + getFileStatus(file).slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {file.download_count}
                    {file.burn_after_read && ' (burn after read)'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/share/${file.id}`)}
                        className="text-electric-blue hover:text-electric-blue-light text-sm font-medium transition-colors"
                      >
                        Copy Link
                      </button>
                      {getFileStatus(file) === 'active' && (
                        <button
                          onClick={() => setShowRevokeModal(file.id)}
                          className="text-error hover:text-error/80 text-sm font-medium transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revoke Confirmation Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 animate-scale-in">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Revoke File Access
              </h3>
              <p className="text-text-secondary mb-6">
                Are you sure you want to revoke access to this file? This action cannot be undone and the file will be permanently deleted.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRevokeModal(null)}
                  className="flex-1 py-2 px-4 text-text-secondary hover:text-text-primary bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRevoke(showRevokeModal)}
                  disabled={isRevoking}
                  className="flex-1 py-2 px-4 bg-error hover:bg-error/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRevoking ? 'Revoking...' : 'Revoke Access'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  app_metadata: unknown;
  user_metadata: unknown;
}

interface SupabaseProjectInfo {
  projectUrl: string;
  projectId: string;
  region: string;
  status: string;
  databaseUrl: string;
  apiUrl: string;
}

export function ProfileSection() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projectInfo, setProjectInfo] = useState<SupabaseProjectInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'project' | 'security'>('profile');

  useEffect(() => {
    loadUserData();
    loadProjectInfo();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
          last_sign_in_at: user.last_sign_in_at,
          app_metadata: user.app_metadata,
          user_metadata: user.user_metadata
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadProjectInfo = () => {
    // Extract project info from Supabase URL
    const supabaseUrl = 'https://gbjvlaboflhkvlbkuram.supabase.co';
    const projectId = 'gbjvlaboflhkvlbkuram';
    
    setProjectInfo({
      projectUrl: supabaseUrl,
      projectId: projectId,
      region: 'us-east-1', // Default region
      status: 'Active',
      databaseUrl: `${supabaseUrl}/rest/v1/`,
      apiUrl: `${supabaseUrl}/rest/v1/`
    });
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-400 bg-green-400/10';
      case 'inactive':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-yellow-400 bg-yellow-400/10';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-darker border border-white/10 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-darker border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Profile & Project</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-300 ${
            activeTab === 'profile'
              ? 'bg-electric-blue text-white shadow-lg'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('project')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-300 ${
            activeTab === 'project'
              ? 'bg-electric-blue text-white shadow-lg'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Project
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-300 ${
            activeTab === 'security'
              ? 'bg-electric-blue text-white shadow-lg'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Security
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && user && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">User Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-text-secondary">Email</label>
                  <p className="text-text-primary font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">User ID</label>
                  <p className="text-text-primary font-mono text-sm">{user.id}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Account Created</label>
                  <p className="text-text-primary">{formatDate(user.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Email Confirmed</label>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.email_confirmed_at ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                    }`}>
                      {user.email_confirmed_at ? 'Confirmed' : 'Pending'}
                    </span>
                    {user.email_confirmed_at && (
                      <span className="text-text-secondary text-sm">
                        {formatDate(user.email_confirmed_at)}
                      </span>
                    )}
                  </div>
                </div>
                {user.last_sign_in_at && (
                  <div>
                    <label className="text-sm text-text-secondary">Last Sign In</label>
                    <p className="text-text-primary">{formatDate(user.last_sign_in_at)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Account Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Account Status</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Authentication</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400">
                    Supabase Auth
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Security Level</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-400/10 text-purple-400">
                    Zero-Knowledge
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'project' && projectInfo && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Details */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Supabase Project</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-text-secondary">Project ID</label>
                  <p className="text-text-primary font-mono text-sm">{projectInfo.projectId}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Project URL</label>
                  <p className="text-text-primary font-mono text-sm break-all">{projectInfo.projectUrl}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Region</label>
                  <p className="text-text-primary">{projectInfo.region}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(projectInfo.status)}`}>
                    {projectInfo.status}
                  </span>
                </div>
              </div>
            </div>

            {/* API Endpoints */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">API Endpoints</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-text-secondary">Database URL</label>
                  <p className="text-text-primary font-mono text-sm break-all">{projectInfo.databaseUrl}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">REST API</label>
                  <p className="text-text-primary font-mono text-sm break-all">{projectInfo.apiUrl}</p>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Auth Endpoint</label>
                  <p className="text-text-primary font-mono text-sm break-all">{projectInfo.projectUrl}/auth/v1/</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://supabase.com/dashboard/project/${projectInfo.projectId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-electric-blue hover:bg-electric-blue-dark text-white text-sm font-medium rounded-lg transition-colors"
              >
                Open Supabase Dashboard
              </a>
              <a
                href={`https://supabase.com/dashboard/project/${projectInfo.projectId}/sql`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-text-primary text-sm font-medium rounded-lg transition-colors"
              >
                SQL Editor
              </a>
              <a
                href={`https://supabase.com/dashboard/project/${projectInfo.projectId}/auth/settings`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-text-primary text-sm font-medium rounded-lg transition-colors"
              >
                Auth Settings
              </a>
              <a
                href={`https://supabase.com/dashboard/project/${projectInfo.projectId}/settings/api`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-text-primary text-sm font-medium rounded-lg transition-colors"
              >
                API Settings
              </a>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Security Features */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Security Features</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Zero-Knowledge Encryption</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Client-Side Encryption</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                    AES-256-GCM
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Key Derivation</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                    PBKDF2 (100k)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Row Level Security</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                    Enabled
                  </span>
                </div>
              </div>
            </div>

            {/* Data Protection */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Data Protection</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">File Names</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                    Encrypted
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">File Content</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                    Encrypted
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Metadata</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                    Encrypted
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Server Access</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-400/10 text-red-400">
                    No Access
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-400 mb-1">Zero-Knowledge Architecture</h4>
                <p className="text-sm text-text-secondary">
                  Your data is encrypted client-side before upload. The server never has access to your unencrypted files or passwords. 
                  Even in the event of a server breach, your data remains secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ProjectStats {
  totalFiles: number;
  totalUsers: number;
  totalStorage: number;
  lastActivity: string;
}

export default function ProjectPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);

  useEffect(() => {
    checkAuth();
    loadProjectStats();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectStats = async () => {
    try {
      // Get file count
      const { count: fileCount } = await supabase
        .from('shared_files')
        .select('*', { count: 'exact', head: true });

      // Mock other stats for demo
      setProjectStats({
        totalFiles: fileCount || 0,
        totalUsers: 1, // In a real app, you'd count users
        totalStorage: 0, // In a real app, you'd calculate storage
        lastActivity: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading project stats:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Authentication Required</h2>
          <p className="text-text-secondary mb-6">Please log in to access project details.</p>
          <a
            href="/"
            className="px-6 py-3 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">AetherVault Project</h1>
          <p className="text-lg text-text-secondary">
            Complete overview of your zero-knowledge file sharing platform
          </p>
        </div>

        {/* Project Stats */}
        {projectStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-slate-darker border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Total Files</p>
                  <p className="text-3xl font-bold text-text-primary">{projectStats.totalFiles}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-darker border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Active Users</p>
                  <p className="text-3xl font-bold text-text-primary">{projectStats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-darker border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Storage Used</p>
                  <p className="text-3xl font-bold text-text-primary">0 MB</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-darker border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Last Activity</p>
                  <p className="text-sm font-medium text-text-primary">Now</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Supabase Configuration */}
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Supabase Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary">Project ID</label>
                <p className="text-text-primary font-mono text-sm">gbjvlaboflhkvlbkuram</p>
              </div>
              
              <div>
                <label className="text-sm text-text-secondary">Project URL</label>
                <p className="text-text-primary font-mono text-sm break-all">https://gbjvlaboflhkvlbkuram.supabase.co</p>
              </div>
              
              <div>
                <label className="text-sm text-text-secondary">Region</label>
                <p className="text-text-primary">us-east-1</p>
              </div>
              
              <div>
                <label className="text-sm text-text-secondary">Status</label>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                  Active
                </span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="https://supabase.com/dashboard/project/gbjvlaboflhkvlbkuram"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-electric-blue hover:bg-electric-blue-dark text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open Supabase Dashboard
              </a>
            </div>
          </div>

          {/* Security Features */}
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Security Features</h2>
            
            <div className="space-y-4">
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
              
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Email Confirmation</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                  Required
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-slate-darker border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard"
              className="flex items-center p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-text-primary">Dashboard</h3>
                <p className="text-sm text-text-secondary">Manage your files</p>
              </div>
            </a>

            <a
              href="https://supabase.com/dashboard/project/gbjvlaboflhkvlbkuram/sql"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-text-primary">SQL Editor</h3>
                <p className="text-sm text-text-secondary">Database management</p>
              </div>
            </a>

            <a
              href="https://supabase.com/dashboard/project/gbjvlaboflhkvlbkuram/auth/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-text-primary">Auth Settings</h3>
                <p className="text-sm text-text-secondary">Authentication config</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

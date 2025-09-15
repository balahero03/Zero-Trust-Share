'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ConfigPage() {
  const [configStatus, setConfigStatus] = useState<{
    supabaseConnection: 'checking' | 'success' | 'error';
    authStatus: 'checking' | 'success' | 'error';
    message: string;
  }>({
    supabaseConnection: 'checking',
    authStatus: 'checking',
    message: 'Checking configuration...'
  });

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      // Test Supabase connection
      const { data, error } = await supabase.from('shared_files').select('count').limit(1);
      
      if (error) {
        setConfigStatus({
          supabaseConnection: 'error',
          authStatus: 'error',
          message: `Database connection failed: ${error.message}`
        });
        return;
      }

      setConfigStatus(prev => ({
        ...prev,
        supabaseConnection: 'success',
        message: 'Supabase connection successful!'
      }));

      // Test authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      setConfigStatus(prev => ({
        ...prev,
        authStatus: session ? 'success' : 'error',
        message: session ? 'Authentication working! User is logged in.' : 'Authentication working! No user logged in (this is normal).'
      }));

    } catch (err) {
      setConfigStatus({
        supabaseConnection: 'error',
        authStatus: 'error',
        message: `Configuration check failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          AetherVault Configuration Status
        </h1>

        {/* Configuration Status */}
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            System Status
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getStatusIcon(configStatus.supabaseConnection)}</span>
              <div>
                <p className={`font-medium ${getStatusColor(configStatus.supabaseConnection)}`}>
                  Supabase Connection
                </p>
                <p className="text-text-secondary text-sm">
                  Database and API connectivity
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getStatusIcon(configStatus.authStatus)}</span>
              <div>
                <p className={`font-medium ${getStatusColor(configStatus.authStatus)}`}>
                  Authentication System
                </p>
                <p className="text-text-secondary text-sm">
                  User authentication and session management
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <p className="text-text-primary">
              <strong>Status:</strong> {configStatus.message}
            </p>
          </div>
        </div>

        {/* Configuration Instructions */}
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Required Supabase Configuration
          </h2>
          
          <div className="space-y-4 text-text-secondary">
            <div>
              <h3 className="font-medium text-text-primary mb-2">1. Authentication Settings</h3>
              <p>Go to your Supabase Dashboard → Authentication → Settings</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Set <strong>Site URL</strong> to: <code className="bg-white/10 px-2 py-1 rounded">http://localhost:3000</code></li>
                <li>Add <strong>Redirect URLs</strong>: <code className="bg-white/10 px-2 py-1 rounded">http://localhost:3000/**</code></li>
                <li><strong>Disable</strong> "Enable email confirmations" for development</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-text-primary mb-2">2. Database Schema</h3>
              <p>Go to your Supabase Dashboard → SQL Editor</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Copy the contents of <code className="bg-white/10 px-2 py-1 rounded">supabase-schema.sql</code></li>
                <li>Paste and run the SQL to create tables and policies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Quick Actions
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={checkConfiguration}
              className="px-4 py-2 bg-electric-blue hover:bg-electric-blue-dark text-white rounded-lg transition-colors"
            >
              🔄 Recheck Configuration
            </button>
            
            <a
              href="https://supabase.com/dashboard/project/gbjvlaboflhkvlbkuram"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-text-primary rounded-lg transition-colors"
            >
              🔗 Open Supabase Dashboard
            </a>
            
            <a
              href="/"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-text-primary rounded-lg transition-colors"
            >
              🏠 Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

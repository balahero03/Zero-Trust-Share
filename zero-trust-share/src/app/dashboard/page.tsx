'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DashboardView } from '@/components/DashboardView';
import { ProfileSection } from '@/components/ProfileSection';

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'files' | 'profile'>('files');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Authentication Required</h2>
          <p className="text-text-secondary mb-6">Please log in to access your dashboard.</p>
          <button
            onClick={handleBackToHome}
            className="px-6 py-3 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* Dashboard Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-text-secondary mt-2">Manage your files and account settings</p>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setActiveView('files')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                activeView === 'files'
                  ? 'bg-electric-blue text-white shadow-lg'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              My Files
            </button>
            <button
              onClick={() => setActiveView('profile')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                activeView === 'profile'
                  ? 'bg-electric-blue text-white shadow-lg'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Profile & Project
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main>
          {activeView === 'files' && <DashboardView />}
          {activeView === 'profile' && <ProfileSection />}
        </main>
      </div>
    </div>
  );
}

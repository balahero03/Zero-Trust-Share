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
  const [showPasswordUpdatedMessage, setShowPasswordUpdatedMessage] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Check for password updated message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('message') === 'password-updated') {
      setShowPasswordUpdatedMessage(true);
      // Clear the message from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
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
      
      {/* Password Updated Success Message */}
      {showPasswordUpdatedMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4 animate-slide-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-success">Password Updated Successfully!</h4>
                  <p className="text-sm text-text-secondary">Your account is now secured with your new password.</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordUpdatedMessage(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
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

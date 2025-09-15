'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { AuthModal } from './AuthModal';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
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
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-electric-blue to-electric-blue-light rounded-lg flex items-center justify-center animate-pulse-glow group-hover:animate-bounce">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary group-hover:text-electric-blue transition-colors">
                  AetherVault
                </h1>
                <p className="text-sm text-text-secondary">Zero-Trust File Sharing</p>
              </div>
            </Link>
            
            {/* Navigation & Auth Buttons */}
            <div className="flex items-center space-x-3">
              {!isAuthenticated ? (
                <button
                  onClick={handleLogin}
                  className="px-6 py-2 text-sm font-medium text-text-primary bg-electric-blue hover:bg-electric-blue-dark rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25"
                >
                  Login
                </button>
              ) : (
                <>
                  <a
                    href="/download"
                    className="px-4 py-2 text-sm font-medium text-text-primary bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                  >
                    Download
                  </a>
                  <a
                    href="/dashboard"
                    className="px-4 py-2 text-sm font-medium text-text-primary bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/project"
                    className="px-4 py-2 text-sm font-medium text-text-primary bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                  >
                    Project
                  </a>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-text-primary bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={handleCloseAuthModal}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

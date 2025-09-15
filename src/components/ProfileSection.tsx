'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { handleAuthError } from '@/lib/auth-utils';

interface User {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  app_metadata: unknown;
  user_metadata: unknown;
}

interface ProfileSectionProps {
  onLogout: () => void;
}

export function ProfileSection({ onLogout }: ProfileSectionProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          await handleAuthError(error);
          setUser(null);
        } else if (user) {
          setUser({
            id: user.id,
            email: user.email || 'Unknown',
            created_at: user.created_at,
            email_confirmed_at: user.email_confirmed_at,
            last_sign_in_at: user.last_sign_in_at,
            app_metadata: user.app_metadata,
            user_metadata: user.user_metadata
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        await handleAuthError(error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || 'Unknown',
          created_at: session.user.created_at,
          email_confirmed_at: session.user.email_confirmed_at,
          last_sign_in_at: session.user.last_sign_in_at,
          app_metadata: session.user.app_metadata,
          user_metadata: session.user.user_metadata
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-electric-blue to-electric-blue-light rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {getInitials(user.email)}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-text-primary truncate max-w-32">
            {user.email.split('@')[0]}
          </p>
          <p className="text-xs text-text-secondary">
            {user.email.split('@')[1]}
          </p>
        </div>
        <svg 
          className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-slate-darker border border-white/10 rounded-xl shadow-2xl z-50 animate-slide-in-up">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-electric-blue to-electric-blue-light rounded-full flex items-center justify-center text-white text-lg font-semibold">
                  {getInitials(user.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary truncate">
                    {user.email}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Member since {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <a
                href="/dashboard"
                className="flex items-center space-x-3 px-3 py-2 text-text-primary hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                <span>Dashboard</span>
              </a>

              <a
                href="/config"
                className="flex items-center space-x-3 px-3 py-2 text-text-primary hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </a>

              <div className="border-t border-white/10 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 text-error hover:bg-error/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
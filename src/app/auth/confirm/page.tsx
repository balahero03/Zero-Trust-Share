'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function EmailConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    handleEmailConfirmation();
  }, [handleEmailConfirmation]);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      router.push('/');
    }
  }, [status, countdown, router]);

  const handleEmailConfirmation = useCallback(async () => {
    try {
      // Get URL parameters
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      console.log('URL params:', { tokenHash, type, token, email });

      // Try different confirmation methods based on available parameters
      if (tokenHash && type === 'email') {
        // Method 1: Using token_hash (newer Supabase versions)
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email'
        });

        if (error) {
          console.error('Token hash verification error:', error);
          throw error;
        }

        if (data.user) {
          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting to AetherVault...');
          return;
        }
      } else if (token && email) {
        // Method 2: Using token and email (older Supabase versions)
        const { data, error } = await supabase.auth.verifyOtp({
          token,
          type: 'email',
          email
        });

        if (error) {
          console.error('Token verification error:', error);
          throw error;
        }

        if (data.user) {
          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting to AetherVault...');
          return;
        }
      } else {
        // Method 3: Try to get the current session (in case user is already confirmed)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session && session.user && session.user.email_confirmed_at) {
          setStatus('success');
          setMessage('Email already confirmed! Redirecting to AetherVault...');
          return;
        }

        if (sessionError) {
          console.error('Session check error:', sessionError);
        }

        setStatus('error');
        setMessage('Invalid confirmation link. Please check your email for the correct link.');
        return;
      }

      setStatus('error');
      setMessage('Email confirmation failed. Please try again.');
    } catch (err: unknown) {
      console.error('Unexpected error:', err);
      setStatus('error');
      setMessage(`Email confirmation failed: ${err instanceof Error ? err.message : 'Please try again.'}`);
    }
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="w-16 h-16 border-4 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin mx-auto mb-6"></div>
        );
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-electric-blue';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">AetherVault</h1>
            <p className="text-text-secondary">Zero-Knowledge File Sharing</p>
          </div>

          {/* Status Icon */}
          {getStatusIcon()}

          {/* Status Message */}
          <div className="mb-8">
            <h2 className={`text-xl font-semibold mb-4 ${getStatusColor()}`}>
              {status === 'loading' && 'Verifying Email'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Verification Failed'}
            </h2>
            
            <p className="text-text-secondary mb-4">
              {message}
            </p>

            {status === 'success' && (
              <p className="text-sm text-text-secondary">
                Redirecting to AetherVault in {countdown} seconds...
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {status === 'success' && (
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 px-4 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25"
              >
                Go to AetherVault
              </button>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth')}
                  className="w-full py-3 px-4 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25"
                >
                  Try Again
                </button>
                
                <Link
                  href="/"
                  className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-text-primary font-medium rounded-lg transition-all duration-300 text-center"
                >
                  Back to Home
                </Link>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-sm text-text-secondary">
                Please wait while we verify your email...
              </div>
            )}
          </div>

          {/* Help Text */}
          {status === 'error' && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">
                <strong>Need help?</strong> Make sure you clicked the link from your email within 24 hours. 
                If the link has expired, please try signing up again.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            ← Back to AetherVault
          </Link>
        </div>
      </div>
    </div>
  );
}

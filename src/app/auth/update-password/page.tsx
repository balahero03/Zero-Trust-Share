'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  const router = useRouter();
  // const searchParams = useSearchParams(); // Unused variable

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if we have a valid session from the password reset
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError('Invalid or expired reset link. Please request a new password reset.');
          setIsCheckingSession(false);
          return;
        }

        if (session) {
          setIsValidSession(true);
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.');
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError('An error occurred while verifying your reset link.');
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Basic validation
      if (!password || !confirmPassword) {
        throw new Error('Please fill in all fields');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw new Error(error.message);
      }

      // Show success message
      setSuccess(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating your password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessRedirect = async () => {
    // Sign out the user to force fresh authentication after password reset
    try {
      await supabase.auth.signOut();
      // Redirect to home with a message to sign in again
      router.push('/?message=password-updated-please-signin');
    } catch (error) {
      console.error('Sign out error:', error);
      router.push('/?message=password-updated-please-signin');
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 animate-slide-in-up">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Verifying Reset Link</h2>
              <p className="text-text-secondary text-sm">Please wait while we verify your password reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-electric-blue to-electric-blue-light rounded-xl flex items-center justify-center animate-pulse-glow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">AetherVault</h1>
                <p className="text-sm text-text-secondary">Zero-Trust File Sharing</p>
              </div>
            </Link>
          </div>

          {/* Success Card */}
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 animate-slide-in-up">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-text-primary mb-4">Password Updated!</h2>
              
              <p className="text-text-secondary mb-6">
<<<<<<< HEAD
                Your password has been successfully updated! For security reasons, please sign in again with your new password.
=======
                Your password has been successfully updated! You&apos;re now signed in and ready to continue.
>>>>>>> 2db990ee7db075780762571dbde6a4fd329fc525
              </p>

              <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-success mb-1">Security Updated</h4>
                    <p className="text-sm text-text-secondary">
                      Your account is now secured with your new password. Remember to keep it safe!
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSuccessRedirect}
                className="w-full px-6 py-4 bg-electric-blue hover:bg-electric-blue-dark text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-electric-blue/25"
              >
                Sign In with New Password
              </button>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-electric-blue to-electric-blue-light rounded-xl flex items-center justify-center animate-pulse-glow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">AetherVault</h1>
                <p className="text-sm text-text-secondary">Zero-Trust File Sharing</p>
              </div>
            </Link>
          </div>

          {/* Error Card */}
          <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 animate-slide-in-up">
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-text-primary mb-4">Invalid Reset Link</h2>
              
              <p className="text-text-secondary mb-6">
                {error || 'This password reset link is invalid or has expired. Please request a new one.'}
              </p>

              <div className="space-y-3">
                <Link
                  href="/auth/reset-password"
                  className="block w-full px-6 py-3 bg-electric-blue hover:bg-electric-blue-dark text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-electric-blue/25 text-center"
                >
                  Request New Reset Link
                </Link>
                
                <Link
                  href="/auth"
                  className="block w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-text-primary rounded-lg font-semibold transition-all duration-300 text-center"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-electric-blue to-electric-blue-light rounded-xl flex items-center justify-center animate-pulse-glow">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">AetherVault</h1>
              <p className="text-sm text-text-secondary">Zero-Trust File Sharing</p>
            </div>
          </Link>
        </div>

        {/* Update Password Form */}
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 animate-slide-in-up">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Set New Password</h2>
            <p className="text-text-secondary text-sm">
              Enter your new password below. Make sure it&apos;s secure and easy to remember.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                placeholder="Enter your new password"
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                placeholder="Confirm your new password"
                disabled={isLoading}
                minLength={6}
              />
            </div>

            {/* Password Requirements */}
            <div className="bg-electric-blue/10 border border-electric-blue/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-electric-blue mb-2">Password Requirements:</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${password.length >= 6 ? 'bg-success' : 'bg-gray-500'}`}></span>
                  <span>At least 6 characters</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${password === confirmPassword && password.length > 0 ? 'bg-success' : 'bg-gray-500'}`}></span>
                  <span>Passwords match</span>
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-error text-sm">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || password.length < 6 || password !== confirmPassword}
              className="w-full px-6 py-4 bg-electric-blue hover:bg-electric-blue-dark disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-electric-blue/25"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Updating Password...</span>
                </div>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

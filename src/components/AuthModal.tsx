'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { deriveMasterKey } from '@/lib/encryption';
import { initializeMasterKey } from '@/lib/auth-utils';
import { SuccessModal } from './SuccessModal';
import { ResetPasswordModal } from './ResetPasswordModal';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: () => void;
}

type AuthMode = 'login' | 'signup';

export function AuthModal({ onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Basic validation
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      if (mode === 'signup' && password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (mode === 'signup') {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        // Check if email confirmation is required
        if (data.user && !data.user.email_confirmed_at) {
          // Show success message with email confirmation instructions
          setError('');
          setIsLoading(false);
          
          // Show success modal
          setSuccessMessage('Account created successfully! Please check your email and click the confirmation link to activate your account.');
          setShowSuccessModal(true);
          return;
        }
      } else {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (!data.user) {
          throw new Error('Login failed');
        }
      }

      // Initialize master key for zero-knowledge architecture
      // This key will be used to encrypt/decrypt file metadata
      await initializeMasterKey();
      
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-300 ${
              mode === 'login'
                ? 'bg-electric-blue text-white shadow-lg'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-300 ${
              mode === 'signup'
                ? 'bg-electric-blue text-white shadow-lg'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Confirm Password (Signup only) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

          {/* Footer */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-text-secondary text-sm">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-electric-blue hover:text-electric-blue-light font-medium transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
          
          {mode === 'login' && (
            <p className="text-text-secondary text-sm">
              Forgot your password?{' '}
              <button
                onClick={() => setShowResetPasswordModal(true)}
                className="text-electric-blue hover:text-electric-blue-light font-medium transition-colors"
              >
                Reset it here
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        title="Check Your Email!"
        message={successMessage}
        email={email}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        onSuccess={() => {
          setShowResetPasswordModal(false);
          // Optionally close the main modal or show success message
        }}
      />
    </div>
  );
}

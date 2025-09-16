'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    mobileNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'login' || modeParam === 'signup') {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signup' && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, just redirect
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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

        {/* Auth Form */}
        <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 animate-slide-in-up">
          {/* Mode Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-electric-blue text-white shadow-lg'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-electric-blue text-white shadow-lg'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={mode === 'signup'}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="mobileNumber" className="block text-sm font-medium text-text-primary">
                    Mobile Number
                  </label>
                  <input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                    placeholder="Enter your mobile number"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required={mode === 'signup'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                  placeholder="Confirm your password"
                />
              </div>
            )}

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
              disabled={isLoading}
              className="w-full px-6 py-4 bg-electric-blue hover:bg-electric-blue-dark disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-electric-blue/25"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                </div>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Additional Options */}
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
                <Link
                  href="/auth/reset-password"
                  className="text-electric-blue hover:text-electric-blue-light font-medium transition-colors"
                >
                  Reset it here
                </Link>
              </p>
            )}
          </div>

          {/* Demo Notice */}
          <div className="mt-6 bg-electric-blue/10 border border-electric-blue/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-electric-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-electric-blue mb-1">Demo Mode</h4>
                <p className="text-sm text-text-secondary">
                  This is a demonstration. Authentication is simulated for demo purposes.
                </p>
              </div>
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

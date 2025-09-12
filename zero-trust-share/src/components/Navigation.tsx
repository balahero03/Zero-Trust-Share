'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export function Navigation({ isAuthenticated = false, onLogout }: NavigationProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center animate-pulse-glow group-hover:animate-bounce">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">ZeroVault</h1>
              <p className="text-sm text-gray-300">Zero-Trust File Sharing</p>
            </div>
          </Link>
          
          <nav className="flex items-center space-x-4">
            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="/upload"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isActive('/upload')
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                Upload
              </Link>
              <Link
                href="/download"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isActive('/download')
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                Download
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/auth?mode=login"
                    className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth?mode=signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-col space-y-2">
            <Link
              href="/upload"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                isActive('/upload')
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white bg-white/10 hover:bg-white/20'
              }`}
            >
              Upload File
            </Link>
            <Link
              href="/download"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                isActive('/download')
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'text-white bg-white/10 hover:bg-white/20'
              }`}
            >
              Download File
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

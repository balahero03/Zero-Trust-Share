'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardView } from '@/components/DashboardView';

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Mock authenticated state

  const handleBackToHome = () => {
    router.push('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DashboardView />
      </main>
    </div>
  );
}

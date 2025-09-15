'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [tests, setTests] = useState({
    connection: { status: 'pending', message: 'Testing...' },
    auth: { status: 'pending', message: 'Testing...' },
    database: { status: 'pending', message: 'Testing...' }
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    // Test 1: Supabase Connection
    try {
      const { data, error } = await supabase.from('shared_files').select('count').limit(1);
      if (error) {
        setTests(prev => ({
          ...prev,
          connection: { status: 'error', message: `Connection failed: ${error.message}` }
        }));
      } else {
        setTests(prev => ({
          ...prev,
          connection: { status: 'success', message: 'Supabase connection successful!' }
        }));
      }
    } catch (err) {
      setTests(prev => ({
        ...prev,
        connection: { status: 'error', message: `Connection error: ${err}` }
      }));
    }

    // Test 2: Authentication
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setTests(prev => ({
        ...prev,
        auth: { 
          status: 'success', 
          message: session ? 'User is logged in' : 'No user logged in (normal)' 
        }
      }));
    } catch (err) {
      setTests(prev => ({
        ...prev,
        auth: { status: 'error', message: `Auth error: ${err}` }
      }));
    }

    // Test 3: Database Schema
    try {
      const { data, error } = await supabase
        .from('shared_files')
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        setTests(prev => ({
          ...prev,
          database: { status: 'error', message: 'Database schema not set up. Run supabase-schema.sql' }
        }));
      } else if (error) {
        setTests(prev => ({
          ...prev,
          database: { status: 'error', message: `Database error: ${error.message}` }
        }));
      } else {
        setTests(prev => ({
          ...prev,
          database: { status: 'success', message: 'Database schema is set up correctly!' }
        }));
      }
    } catch (err) {
      setTests(prev => ({
        ...prev,
        database: { status: 'error', message: `Database test error: ${err}` }
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          AetherVault System Test
        </h1>

        <div className="grid gap-6">
          {Object.entries(tests).map(([key, test]) => (
            <div key={key} className="bg-slate-darker border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">{getStatusIcon(test.status)}</span>
                <div>
                  <h2 className={`text-xl font-semibold ${getStatusColor(test.status)}`}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} Test
                  </h2>
                  <p className="text-text-secondary">
                    {test.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-slate-darker border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Next Steps
          </h2>
          
          <div className="space-y-4 text-text-secondary">
            <div>
              <h3 className="font-medium text-text-primary mb-2">If Database Test Failed:</h3>
              <p>1. Go to your Supabase dashboard</p>
              <p>2. Navigate to SQL Editor</p>
              <p>3. Copy and run the contents of <code className="bg-white/10 px-2 py-1 rounded">supabase-schema.sql</code></p>
            </div>
            
            <div>
              <h3 className="font-medium text-text-primary mb-2">If Connection Test Failed:</h3>
              <p>1. Check your API keys in <code className="bg-white/10 px-2 py-1 rounded">src/lib/supabase.ts</code></p>
              <p>2. Verify your Supabase project URL</p>
            </div>
            
            <div>
              <h3 className="font-medium text-text-primary mb-2">If All Tests Pass:</h3>
              <p>1. Go to <a href="/" className="text-electric-blue hover:underline">the main page</a></p>
              <p>2. Test the signup and email confirmation flow</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={runTests}
            className="px-6 py-3 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-colors"
          >
            🔄 Run Tests Again
          </button>
        </div>
      </div>
    </div>
  );
}

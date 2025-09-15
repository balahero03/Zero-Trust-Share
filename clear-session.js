/**
 * Clear Session Script
 * Run this to clear any invalid Supabase sessions
 */

// Clear localStorage
if (typeof localStorage !== 'undefined') {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      localStorage.removeItem(key);
      console.log('Removed:', key);
    }
  });
}

// Clear sessionStorage
if (typeof sessionStorage !== 'undefined') {
  sessionStorage.clear();
  console.log('Cleared sessionStorage');
}

console.log('Session cleared! Please refresh your browser.');

#!/usr/bin/env node

/**
 * AetherVault Setup Script
 * This script helps you verify your setup and provides guidance
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 AetherVault Setup Verification\n');

// Check if required files exist
const requiredFiles = [
  'src/lib/supabase.ts',
  'src/app/auth/confirm/page.tsx',
  'src/components/AuthModal.tsx',
  'src/components/SuccessModal.tsx',
  'supabase-schema.sql',
  'package.json'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all files are in place.');
  process.exit(1);
}

console.log('\n✅ All required files are present!');

// Check package.json for required dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['@supabase/supabase-js', 'next', 'react'];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
  }
});

console.log('\n🎯 Next Steps:');
console.log('1. Run the database schema in your Supabase dashboard');
console.log('2. Configure Supabase authentication settings');
console.log('3. Start the development server: npm run dev');
console.log('4. Test the email confirmation flow');
console.log('\n📖 See IMPLEMENTATION_GUIDE.md for detailed instructions');

console.log('\n🔗 Quick Links:');
console.log('- Supabase Dashboard: https://supabase.com/dashboard/project/gbjvlaboflhkvlbkuram');
console.log('- SQL Editor: https://supabase.com/dashboard/project/gbjvlaboflhkvlbkuram/sql');
console.log('- Auth Settings: https://supabase.com/dashboard/project/gbjvlaboflhkvlbkuram/auth/settings');

console.log('\n✨ Setup verification complete!');

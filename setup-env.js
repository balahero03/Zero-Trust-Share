/**
 * Environment Setup Script
 * This will help you create the .env.local file
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL="https://gbjvlaboflhkvlbkuram.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdianZsYWJvZmxoa3ZsYmt1cmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc5MTIsImV4cCI6MjA3MzQ4MzkxMn0.8Q5vFVQ7lJd3XUITxcA4G94BaFlXXERwryt5KygrwLzWzEetGAP6Nb3v0Z3j+TILMmf69ybE4o+AStE80B1g"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdianZsYWJvZmxoa3ZsYmt1cmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzkxMiwiZXhwIjoyMDczNDgzOTEyfQ.Qi4jY72suoAP1kgGd6mEuTp8aoOjRTNgityFFNSxO3Q"

# Next.js Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`;

const envPath = path.join(__dirname, '.env.local');

try {
  if (fs.existsSync(envPath)) {
    console.log('✅ .env.local already exists');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
  }
  
  console.log('📋 Environment variables set:');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL: ✅');
  console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY: ✅');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY: ✅');
  console.log('   - NEXT_PUBLIC_APP_URL: ✅');
  
  console.log('\n🎉 Environment setup complete!');
  console.log('You can now run: npm run dev');
  
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  console.log('\n📝 Manual setup:');
  console.log('Create a file named .env.local in your project root with:');
  console.log(envContent);
}

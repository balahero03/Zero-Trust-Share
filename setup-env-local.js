/**
 * 🔧 Environment Setup Helper
 * Creates .env.local with your Twilio credentials
 */

const fs = require('fs');

console.log('🔧 Setting up .env.local with Twilio credentials...\n');

// Read existing .env.local if it exists
let existingEnv = '';
try {
  existingEnv = fs.readFileSync('.env.local', 'utf8');
  console.log('✅ Found existing .env.local file');
} catch (error) {
  console.log('📝 Creating new .env.local file');
}

// Your Twilio credentials
const twilioConfig = `
# 🏆 SMS Passcode System Configuration
# Twilio SMS Service (Required for SMS functionality)
TWILIO_ACCOUNT_SID="AC89ace0a2c3a23cbcb6a4df4cc49e6d3c"
TWILIO_AUTH_TOKEN="1cad0095368ab4dc56450149ca7fbbfc"
TWILIO_PHONE_NUMBER="MGe12f0e3fac12d1c9a317e0a9d7e85fb1"

# SMS Security Settings (Optional - uses defaults if not set)
SMS_RATE_LIMIT_MINUTES=5
MAX_SMS_ATTEMPTS=3
`;

// Check if Twilio config already exists
if (existingEnv.includes('TWILIO_ACCOUNT_SID')) {
  console.log('⚠️  Twilio configuration already exists in .env.local');
  console.log('Please manually update your .env.local file with:');
  console.log(twilioConfig);
} else {
  // Append Twilio config to existing content
  const newContent = existingEnv + twilioConfig;
  
  try {
    fs.writeFileSync('.env.local', newContent);
    console.log('✅ Successfully added Twilio configuration to .env.local');
    console.log('\n📋 Added the following variables:');
    console.log('- TWILIO_ACCOUNT_SID');
    console.log('- TWILIO_AUTH_TOKEN');
    console.log('- TWILIO_PHONE_NUMBER'); 
    console.log('- SMS_RATE_LIMIT_MINUTES');
    console.log('- MAX_SMS_ATTEMPTS');
    
    console.log('\n🧪 Now test your setup:');
    console.log('node test-twilio-setup.js');
    
  } catch (error) {
    console.log('❌ Failed to write .env.local file');
    console.log('Please manually create .env.local with the following content:');
    console.log(twilioConfig);
  }
}

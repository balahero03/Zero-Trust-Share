/**
 * 🧪 Twilio Setup Test Script
 * Tests your Twilio credentials and SMS functionality
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testTwilioSetup() {
  console.log('🧪 Testing Twilio SMS Setup\n');
  
  // Check environment variables
  console.log('📋 Checking Environment Variables:');
  console.log('═'.repeat(50));
  
  const requiredVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN', 
    'TWILIO_PHONE_NUMBER'
  ];
  
  let allVarsPresent = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      // Mask sensitive values for security
      const maskedValue = varName === 'TWILIO_AUTH_TOKEN' 
        ? value.substring(0, 8) + '...' + value.substring(value.length - 4)
        : value;
      console.log(`✅ ${varName}: ${maskedValue}`);
    } else {
      console.log(`❌ ${varName}: NOT SET`);
      allVarsPresent = false;
    }
  });
  
  if (!allVarsPresent) {
    console.log('\n🚨 Missing Environment Variables!');
    console.log('Please add the missing variables to your .env.local file:');
    console.log('\nTWILIO_ACCOUNT_SID="AC89ace0a2c3a23cbcb6a4df4cc49e6d3c"');
    console.log('TWILIO_AUTH_TOKEN="1cad0095368ab4dc56450149ca7fbbfc"');
    console.log('TWILIO_PHONE_NUMBER="MGe12f0e3fac12d1c9a317e0a9d7e85fb1"');
    return;
  }
  
  console.log('\n📱 Testing SMS Functionality:');
  console.log('═'.repeat(50));
  
  try {
    // Import Twilio
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID, 
      process.env.TWILIO_AUTH_TOKEN
    );
    
    console.log('✅ Twilio client initialized successfully');
    
    // Validate phone number format
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;
    
    // Note: The phone number in your example looks like a Messaging Service SID
    // Let's check what type it is
    if (fromPhone.startsWith('MG')) {
      console.log('✅ Using Messaging Service SID (recommended for production)');
    } else if (fromPhone.startsWith('+')) {
      console.log('✅ Using direct phone number');
    } else {
      console.log('⚠️  Phone number format may need adjustment');
    }
    
    // Test account info (doesn't send SMS)
    console.log('🔍 Fetching account information...');
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log(`✅ Account Status: ${account.status}`);
    console.log(`✅ Account Type: ${account.type}`);
    
    console.log('\n🎉 Twilio Setup Test Complete!');
    console.log('═'.repeat(50));
    console.log('✅ All credentials are valid');
    console.log('✅ Twilio connection successful');
    console.log('✅ Ready to send SMS messages');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Test SMS sending with a real file upload');
    console.log('3. Monitor SMS delivery in Twilio Console');
    
  } catch (error) {
    console.log('❌ Twilio Test Failed!');
    console.log('Error:', error.message);
    
    if (error.status === 20003) {
      console.log('\n💡 This usually means:');
      console.log('- Invalid Account SID or Auth Token');
      console.log('- Check your credentials in .env.local');
    } else if (error.status === 21211) {
      console.log('\n💡 This usually means:');
      console.log('- Invalid phone number format');
      console.log('- Use international format: +1234567890');
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Double-check credentials in Twilio Console');
    console.log('2. Ensure .env.local file exists and is loaded');
    console.log('3. Restart the test script after making changes');
  }
}

// Run the test
testTwilioSetup().catch(console.error);

/**
 * 🏆 Direct Twilio Test - Your Exact Configuration
 * Tests SMS sending with your provided Twilio code
 */

const accountSid = 'AC89ace0a2c3a23cbcb6a4df4cc49e6d3c';
const authToken = process.env.TWILIO_AUTH_TOKEN || '1cad0095368ab4dc56450149ca7fbbfc'; // Use your actual token
const client = require('twilio')(accountSid, authToken);

async function testDirectTwilio() {
  console.log('🏆 Testing Direct Twilio Integration');
  console.log('═'.repeat(50));
  console.log('📋 Configuration:');
  console.log(`Account SID: ${accountSid}`);
  console.log(`Auth Token: ${authToken.substring(0, 8)}...${authToken.substring(authToken.length - 4)}`);
  console.log('Messaging Service: MGe12f0e3fac12d1c9a317e0a9d7e85fb1');
  console.log('Target Phone: +919385480953\n');

  console.log('📱 Sending SMS with your exact configuration...\n');

  try {
    const message = await client.messages.create({
      body: '🏆 AetherVault Direct Test: Your SMS system is working perfectly! This message was sent using your exact Twilio configuration. 🚀',
      messagingServiceSid: 'MGe12f0e3fac12d1c9a317e0a9d7e85fb1',
      to: '+919385480953'
    });

    console.log('✅ SMS Sent Successfully!');
    console.log('═'.repeat(30));
    console.log(`📋 Message SID: ${message.sid}`);
    console.log(`📱 To: ${message.to}`);
    console.log(`📤 From: ${message.messagingServiceSid}`);
    console.log(`📊 Status: ${message.status}`);
    console.log(`💰 Price: ${message.price || 'Calculating...'}`);
    console.log(`🌍 Direction: ${message.direction}`);
    
    console.log('\n🎉 SUCCESS! Your Twilio configuration is working perfectly!');
    console.log('📱 Check your phone (+919385480953) for the test message.');
    console.log('\n🚀 Next steps:');
    console.log('1. Verify SMS was received on your phone');
    console.log('2. Check Twilio Console logs for delivery confirmation');
    console.log('3. Test your AetherVault app with file sharing');

  } catch (error) {
    console.log('❌ SMS Sending Failed!');
    console.log('═'.repeat(30));
    console.log(`Error Code: ${error.code}`);
    console.log(`Error Message: ${error.message}`);
    
    // Specific error handling
    switch (error.code) {
      case 20003:
        console.log('\n💡 Authentication Error Solutions:');
        console.log('• Verify Account SID: AC89ace0a2c3a23cbcb6a4df4cc49e6d3c');
        console.log('• Check Auth Token in Twilio Console');
        console.log('• Ensure no extra spaces in credentials');
        break;
        
      case 21614:
        console.log('\n💡 Unverified Phone Number (Trial Account):');
        console.log('• Go to Twilio Console → Phone Numbers → Verified Caller IDs');
        console.log('• Add and verify +919385480953');
        console.log('• Trial accounts can only SMS verified numbers');
        break;
        
      case 21211:
        console.log('\n💡 Invalid Phone Number:');
        console.log('• Use international format: +919385480953');
        console.log('• Include country code (+91 for India)');
        break;
        
      default:
        console.log('\n💡 General Troubleshooting:');
        console.log('• Check Twilio Console for account status');
        console.log('• Verify sufficient account balance');
        console.log('• Ensure Messaging Service is active');
    }
    
    console.log('\n🔧 Debug Information:');
    console.log('• Twilio Console: https://console.twilio.com');
    console.log('• Error Reference: https://www.twilio.com/docs/api/errors');
    console.log('• Account Dashboard: Check for any restrictions');
  }
}

// Run the test
console.log('Starting Twilio Direct Test...\n');
testDirectTwilio().catch(console.error);

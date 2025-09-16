/**
 * 🧪 Direct SMS Test Script
 * Tests SMS sending with your exact Twilio configuration
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const accountSid = 'AC89ace0a2c3a23cbcb6a4df4cc49e6d3c';
const authToken = '1cad0095368ab4dc56450149ca7fbbfc';
const client = require('twilio')(accountSid, authToken);

async function sendTestSMS() {
  console.log('📱 Sending Test SMS...\n');
  
  try {
    const message = await client.messages.create({
      body: '🏆 AetherVault SMS Test: Your award-winning file sharing system is working! 🚀',
      messagingServiceSid: 'MGe12f0e3fac12d1c9a317e0a9d7e85fb1',
      to: '+919385480953'
    });
    
    console.log('✅ SMS Sent Successfully!');
    console.log('📋 Message Details:');
    console.log(`   SID: ${message.sid}`);
    console.log(`   Status: ${message.status}`);
    console.log(`   To: ${message.to}`);
    console.log(`   From: ${message.messagingServiceSid}`);
    console.log(`   Body: ${message.body}`);
    
    console.log('\n🎉 Your SMS system is working perfectly!');
    console.log('Check your phone (+919385480953) for the test message.');
    
  } catch (error) {
    console.log('❌ SMS Send Failed!');
    console.log('Error:', error.message);
    console.log('Error Code:', error.code);
    
    if (error.code === 20003) {
      console.log('\n💡 Authentication Error:');
      console.log('- Check Account SID and Auth Token');
      console.log('- Verify credentials in Twilio Console');
    } else if (error.code === 21211) {
      console.log('\n💡 Phone Number Error:');
      console.log('- Invalid phone number format');
      console.log('- Ensure international format: +919385480953');
    } else if (error.code === 21614) {
      console.log('\n💡 Unverified Number (Trial Account):');
      console.log('- Phone number must be verified in Twilio Console');
      console.log('- Go to Phone Numbers → Verified Caller IDs');
    }
  }
}

// Run the test
sendTestSMS().catch(console.error);

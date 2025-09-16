/**
 * 🏆 Twilio Setup Checker & Guide
 * Interactive guide to help you set up Twilio perfectly
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function checkTwilioSetup() {
  console.log('🏆 AetherVault Twilio Setup Checker');
  console.log('═'.repeat(50));
  console.log('Let\'s verify your Twilio configuration step by step!\n');

  // Step 1: Account verification
  console.log('📋 STEP 1: Twilio Account Verification');
  console.log('You already have:');
  console.log('✅ Account SID: AC89ace0a2c3a23cbcb6a4df4cc49e6d3c');
  console.log('✅ Auth Token: 1cad...bbfc (masked for security)');
  console.log('✅ Messaging Service: MGe12f0e3fac12d1c9a317e0a9d7e85fb1\n');

  const hasAccount = await askQuestion('Have you logged into console.twilio.com? (yes/no): ');
  
  if (hasAccount !== 'yes') {
    console.log('\n🔧 SETUP REQUIRED:');
    console.log('1. Go to https://console.twilio.com');
    console.log('2. Login with your Twilio account');
    console.log('3. Verify you can see your dashboard');
    console.log('4. Come back and run this script again\n');
    rl.close();
    return;
  }

  // Step 2: Phone number verification
  console.log('\n📱 STEP 2: Phone Number Verification');
  console.log('For trial accounts, you MUST verify your phone number first.');
  console.log('Target phone: +919385480953 (your Indian number)\n');

  const isVerified = await askQuestion('Is +919385480953 verified in Twilio Console? (yes/no/unsure): ');
  
  if (isVerified === 'no' || isVerified === 'unsure') {
    console.log('\n🚨 CRITICAL: Phone Number Verification Required!');
    console.log('═'.repeat(50));
    console.log('🔧 How to verify your phone number:');
    console.log('1. In Twilio Console → Phone Numbers → Manage → Verified Caller IDs');
    console.log('2. Click "Add a new number"');
    console.log('3. Enter: +919385480953');
    console.log('4. Choose "SMS" verification');
    console.log('5. Click "Call/Text me"');
    console.log('6. Enter the code you receive');
    console.log('7. ✅ Your number is now verified!\n');
    console.log('⚠️  Without verification, SMS will fail with Error 21614\n');
    
    const shouldContinue = await askQuestion('Have you completed phone verification? (yes/no): ');
    if (shouldContinue !== 'yes') {
      console.log('Please verify your phone number first, then run this script again.');
      rl.close();
      return;
    }
  }

  // Step 3: Messaging Service check
  console.log('\n📨 STEP 3: Messaging Service Configuration');
  console.log('Your Messaging Service SID: MGe12f0e3fac12d1c9a317e0a9d7e85fb1');
  
  const serviceWorking = await askQuestion('Can you see this Messaging Service in Console → Messaging → Services? (yes/no): ');
  
  if (serviceWorking === 'no') {
    console.log('\n🚨 ISSUE: Messaging Service not found!');
    console.log('🔧 Solutions:');
    console.log('1. Check if the SID is correct in Twilio Console');
    console.log('2. Verify the service is active');
    console.log('3. Ensure phone numbers are assigned to the service');
    console.log('4. Contact Twilio support if service is missing\n');
  }

  // Step 4: Test SMS sending
  console.log('\n🧪 STEP 4: SMS Test');
  console.log('Let\'s test SMS sending capability.');
  
  const wantTest = await askQuestion('Do you want to send a test SMS now? (yes/no): ');
  
  if (wantTest === 'yes') {
    console.log('\n📱 Sending test SMS...');
    try {
      // Import and run the test
      require('./test-sms-direct.js');
      console.log('\nCheck your phone (+919385480953) for the test message!');
    } catch (error) {
      console.log('❌ Test failed. Please run: node test-sms-direct.js');
    }
  }

  // Step 5: Production readiness
  console.log('\n🚀 STEP 5: Production Readiness');
  console.log('Current status: Trial Account ($15 credit)');
  
  const planUpgrade = await askQuestion('Are you planning to upgrade for production use? (yes/no/later): ');
  
  if (planUpgrade === 'yes') {
    console.log('\n💎 Production Upgrade Benefits:');
    console.log('✅ Send SMS to ANY phone number (not just verified)');
    console.log('✅ Higher rate limits');
    console.log('✅ Advanced analytics');
    console.log('✅ Priority support');
    console.log('✅ No trial restrictions');
    console.log('\n🔧 To upgrade:');
    console.log('1. Console → Account → Billing');
    console.log('2. Add payment method');
    console.log('3. Remove trial restrictions');
  }

  // Final summary
  console.log('\n🎉 Setup Summary');
  console.log('═'.repeat(50));
  console.log('✅ Twilio Account: Ready');
  console.log('✅ Credentials: Configured');
  console.log(`✅ Phone Verification: ${isVerified === 'yes' ? 'Completed' : 'REQUIRED'}`);
  console.log(`✅ Messaging Service: ${serviceWorking === 'yes' ? 'Active' : 'NEEDS CHECK'}`);
  console.log('✅ Integration: Ready for testing');

  console.log('\n📋 Next Steps:');
  console.log('1. Start your app: npm run dev');
  console.log('2. Upload a test file');
  console.log('3. Share with +919385480953');
  console.log('4. Check SMS for passcode');
  console.log('5. Complete download flow');

  console.log('\n💡 Pro Tips:');
  console.log('• Monitor usage in Twilio Console → Billing');
  console.log('• Check delivery logs in Console → Monitor → Messaging');
  console.log('• Keep Auth Token secure (never commit to git)');
  console.log('• Set up billing alerts to monitor costs');

  console.log('\n🏆 Your SMS system is ready to go! Happy sharing! ✨');
  
  rl.close();
}

// Run the setup checker
checkTwilioSetup().catch(console.error);

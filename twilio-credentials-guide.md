# 🔧 Twilio Credentials Setup Guide

## 📋 Your Twilio Information

Based on your Java code, I can see your Twilio credentials:

```
Account SID: AC89ace0a2c3a23cbcb6a4df4cc49e6d3c
Auth Token: 1cad0095368ab4dc56450149ca7fbbfc  
Phone/Service: MGe12f0e3fac12d1c9a317e0a9d7e85fb1
```

## 🔍 Important Notes

### **Messaging Service vs Phone Number**
Your `MGe12f0e3fac12d1c9a317e0a9d7e85fb1` appears to be a **Messaging Service SID** (starts with "MG"), not a direct phone number. This is actually **better for production** as it provides:

- ✅ Better delivery rates
- ✅ Automatic failover 
- ✅ Easier scaling
- ✅ Enhanced compliance

### **Security Reminder** ⚠️
- Your Auth Token is sensitive - treat it like a password
- Never commit it to git or share publicly
- The credentials you shared should be kept secure

## 🛠️ Setup Instructions

### **1. Create Your .env.local File**

Create a `.env.local` file in your project root with:

```env
# Supabase Credentials (keep your existing values)
NEXT_PUBLIC_SUPABASE_URL="YOUR_EXISTING_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_EXISTING_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_EXISTING_SERVICE_KEY"

# Next.js Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 🏆 SMS Passcode System Configuration
TWILIO_ACCOUNT_SID="AC89ace0a2c3a23cbcb6a4df4cc49e6d3c"
TWILIO_AUTH_TOKEN="1cad0095368ab4dc56450149ca7fbbfc"
TWILIO_PHONE_NUMBER="MGe12f0e3fac12d1c9a317e0a9d7e85fb1"

# SMS Security Settings (Optional)
SMS_RATE_LIMIT_MINUTES=5
MAX_SMS_ATTEMPTS=3
```

### **2. Test Your Setup**

Run the test script to verify everything works:

```bash
node test-twilio-setup.js
```

This will:
- ✅ Check all environment variables are set
- ✅ Test Twilio connection
- ✅ Validate account status
- ✅ Confirm SMS capability

### **3. Important: Phone Number Format**

For the recipient phone number (your test number `+919385480953`):
- ✅ **Correct format**: `+919385480953` (with country code)
- ❌ **Wrong format**: `919385480953` (missing +)
- ❌ **Wrong format**: `9385480953` (missing country code)

## 🧪 Testing Your SMS System

### **Quick Test Steps:**

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Create Test User Account**
   - Go to `http://localhost:3000`
   - Sign up with your email
   - **Important**: Add your phone number (`+919385480953`) to your profile

3. **Test File Sharing**
   - Upload a test file
   - Share to your own email
   - Verify SMS toggle is enabled
   - Click "Send Secure Share"

4. **Verify Delivery**
   - Check email for file URL
   - Check SMS for 6-digit passcode
   - Complete the download flow

### **Expected SMS Message:**
```
🔐 AetherVault Security Code: 123456

Your secure file "document.pdf" is ready for download.

Enter this code to access your file. Code expires in 15 minutes.

Never share this code with anyone.
```

## 🌍 International SMS Considerations

Since you're using an Indian phone number (`+91`):

### **Costs (Approximate)**
- **India SMS**: ~$0.04 per message
- **Trial Credit**: $15 (covers ~375 SMS messages)

### **Delivery Notes**
- ✅ Twilio has good coverage in India
- ✅ Your Messaging Service should work well
- ⏱️ Delivery typically within 10-30 seconds
- 📱 Works with all major Indian carriers

## 🚨 Troubleshooting

### **Common Issues:**

1. **"Authentication Error" (20003)**
   - Check Account SID and Auth Token are correct
   - Ensure no extra spaces in .env.local

2. **"Invalid Phone Number" (21211)**
   - Verify recipient number includes country code: `+919385480953`
   - Ensure Messaging Service is configured correctly

3. **"Permission Denied" (20404)**
   - Account may need verification for Indian numbers
   - Check Twilio Console for account status

4. **SMS Not Received**
   - Check Twilio logs in Console
   - Verify phone number is reachable
   - Try from a different network

### **Debug Steps:**
1. Run `node test-twilio-setup.js`
2. Check Twilio Console → Logs → Messages
3. Verify account balance and limits
4. Test with a different phone number if available

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Test script shows all green checkmarks
- ✅ SMS arrives within 30 seconds
- ✅ Complete download flow works
- ✅ No errors in browser console

## 🚀 Production Tips

When you're ready to go live:
- 🔐 Keep Auth Token secure
- 📊 Monitor SMS costs and usage
- 🌍 Consider local phone numbers for better delivery
- 📈 Set up webhooks for delivery confirmations
- 🛡️ Configure fraud protection

---

**Ready to test? Run `node test-twilio-setup.js` to verify your setup!** 🚀

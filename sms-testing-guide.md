# 🧪 SMS Passcode System Testing Guide

## 🎯 Pre-Testing Checklist

### **Required Setup**
- ✅ Twilio account created and verified
- ✅ Phone number purchased (with SMS capability)
- ✅ Environment variables added to `.env.local`
- ✅ Database schema updated with SMS table
- ✅ Development server running (`npm run dev`)

### **Twilio Trial Account Limitations**
- 📞 Can only send SMS to **verified phone numbers**
- 💳 $15 trial credit (covers ~2000 SMS messages)
- 🌍 Limited to verified destinations until account upgrade

## 🧪 Testing Steps

### **Phase 1: Basic SMS Functionality**

#### **1.1 Test SMS API Endpoint**
```bash
# Test SMS sending directly (replace with your values)
curl -X POST http://localhost:3000/api/send-sms-passcode \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "test-file-id",
    "recipients": [
      {
        "email": "your-email@example.com",
        "phone": "+1YOUR_VERIFIED_PHONE",
        "userId": "test-user-id"
      }
    ]
  }'
```

**Expected Result:** 
- ✅ 200 OK response
- ✅ SMS received on your verified phone
- ✅ 6-digit passcode in message

#### **1.2 Test SMS Verification Endpoint**
```bash
# Test passcode verification (use passcode from SMS)
curl -X POST http://localhost:3000/api/verify-sms-passcode \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "test-file-id",
    "phone": "+1YOUR_VERIFIED_PHONE",
    "passcode": "123456"
  }'
```

**Expected Result:**
- ✅ 200 OK for correct passcode
- ✅ 400 Bad Request for incorrect passcode
- ✅ File metadata returned on success

### **Phase 2: End-to-End Testing**

#### **2.1 Upload and Share Flow**
1. **Upload Test File**
   - Go to `http://localhost:3000`
   - Upload a small test file (PDF, image, etc.)
   - Note the file ID from the result

2. **Share via Email + SMS**
   - Click "Share via Email" 
   - Add your email address (must be registered user)
   - Verify your phone number shows up
   - Ensure SMS toggle is enabled
   - Click "🚀 Send Secure Share"

3. **Verify Dual Delivery**
   - ✅ Check email for file URL
   - ✅ Check SMS for 6-digit passcode
   - ✅ Both should arrive within 30 seconds

#### **2.2 Download Flow Testing**
1. **Access File URL**
   - Click URL from email OR manually visit download page
   - Enter the file ID from email
   - Enter your phone number

2. **SMS Verification**
   - Should see beautiful SMS passcode input screen
   - Enter 6-digit code from SMS
   - Should auto-advance between input boxes

3. **Auto-Download**
   - File should automatically decrypt and download
   - No manual decryption key needed!
   - Success screen should appear

### **Phase 3: Security Testing**

#### **3.1 Rate Limiting Test**
```bash
# Send multiple SMS rapidly to same phone number
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/send-sms-passcode \
    -H "Content-Type: application/json" \
    -d '{"fileId":"test","recipients":[{"phone":"+1YOUR_PHONE"}]}'
  echo "Request $i sent"
done
```

**Expected Result:**
- ✅ First 3 requests succeed
- ✅ Subsequent requests return rate limit error
- ✅ Clear error message about cooldown period

#### **3.2 Passcode Expiry Test**
1. Request SMS passcode
2. Wait 16+ minutes (passcode expires in 15 min)
3. Try to verify expired passcode
4. **Expected:** Clear expiry error message

#### **3.3 Attempt Limiting Test**
1. Request SMS passcode
2. Enter wrong passcode 3 times
3. Try 4th incorrect attempt
4. **Expected:** Max attempts error message

### **Phase 4: UI/UX Testing**

#### **4.1 Mobile Responsiveness**
- ✅ Test on mobile device/browser dev tools
- ✅ SMS input should be touch-friendly
- ✅ Auto-paste should work from SMS apps
- ✅ All animations smooth on mobile

#### **4.2 Auto-Paste Functionality**
1. Receive SMS passcode on mobile device
2. Copy passcode from SMS app
3. Return to browser and paste in SMS input
4. **Expected:** All 6 digits auto-fill correctly

#### **4.3 Error Handling**
- ✅ Test invalid file IDs
- ✅ Test unregistered email addresses
- ✅ Test phone numbers without SMS capability
- ✅ Test network connection issues

## 📊 Test Results Checklist

### **✅ SMS Functionality**
- [ ] SMS messages delivered successfully
- [ ] Passcodes are 6 digits and random
- [ ] Messages have proper formatting and branding
- [ ] Rate limiting works correctly
- [ ] Expiry timing is accurate (15 minutes)

### **✅ User Experience**
- [ ] Email + SMS dual delivery works
- [ ] SMS passcode input is intuitive
- [ ] Auto-paste works on mobile
- [ ] Auto-download after verification
- [ ] Error messages are helpful
- [ ] Loading states are smooth

### **✅ Security**
- [ ] Rate limiting prevents abuse
- [ ] Passcodes expire correctly
- [ ] Attempt limiting works
- [ ] No sensitive data in SMS content
- [ ] Phone number validation works

### **✅ Integration**
- [ ] Database records created correctly
- [ ] File downloads work after verification
- [ ] Burn-after-read functionality intact
- [ ] Analytics/logging working
- [ ] Backward compatibility maintained

## 🐛 Common Issues & Solutions

### **SMS Not Received**
- ✅ Check phone number format (must be +1XXXXXXXXXX)
- ✅ Verify phone number in Twilio console (trial accounts)
- ✅ Check Twilio logs for delivery status
- ✅ Ensure sufficient Twilio credit

### **API Errors**
- ✅ Check `.env.local` has correct Twilio credentials
- ✅ Verify Twilio Auth Token is valid
- ✅ Check server logs for detailed error messages
- ✅ Ensure database schema is updated

### **Auto-Paste Not Working**
- ✅ Test on different browsers/devices
- ✅ Check clipboard permissions
- ✅ Verify SMS format matches expected pattern
- ✅ Try manual entry as fallback

### **Rate Limiting Too Aggressive**
- ✅ Adjust `SMS_RATE_LIMIT_MINUTES` in `.env.local`
- ✅ Clear test data from `sms_verification` table
- ✅ Check system clock accuracy

## 🎉 Success Criteria

Your SMS system is working perfectly when:
- 🚀 **Fast delivery**: SMS arrives within 10 seconds
- 📱 **Mobile optimized**: Smooth experience on phones
- 🔒 **Secure**: Rate limiting and expiry work correctly
- ✨ **Intuitive**: Users can complete flow without help
- 🛡️ **Robust**: Handles errors gracefully

## 📈 Production Readiness

Before going live:
- [ ] Upgrade Twilio account for unrestricted sending
- [ ] Set up SMS delivery webhooks for monitoring
- [ ] Configure proper error alerting
- [ ] Load test with realistic user volumes
- [ ] Set up cost monitoring and budgets
- [ ] Review and audit security settings

---

**🏆 Congratulations! You now have an award-winning SMS passcode system ready for production!**

*Need help debugging? Check the console logs and Twilio delivery reports for detailed information.*

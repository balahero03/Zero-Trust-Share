# 🔧 Email Confirmation Fix Guide

## The Problem
You're getting "Invalid confirmation link" error because Supabase email confirmation requires specific configuration.

## 🎯 Quick Fix Steps

### Step 1: Configure Supabase Authentication Settings

**Go to your Supabase Dashboard:**
1. Navigate to: https://supabase.com/dashboard/project/gbjvlaboflhkvlbkuram/auth/settings

2. **Set these exact settings:**

```
Site URL: http://localhost:3000

Additional Redirect URLs:
- http://localhost:3000/**
- http://localhost:3000/auth/confirm
- http://localhost:3000/auth/callback
```

3. **Email Settings:**
```
☑ Enable email confirmations
☑ Enable email change confirmations
```

4. **Save the changes**

### Step 2: Update Email Template (CRITICAL)

**Go to Authentication > Email Templates:**
1. Click on "Confirm signup" template
2. **Replace the confirmation link** with this:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
```

3. **Save the template**

### Step 3: Test the Flow

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Test signup:**
   - Go to http://localhost:3000
   - Sign up with a new email
   - Check your email for the confirmation link

3. **Click the confirmation link**
   - Should redirect to `/auth/confirm`
   - Should show success message
   - Should auto-redirect to main page

## 🔍 Debugging Steps

### Check URL Parameters
When you click the email link, check the URL in your browser. It should look like:
```
http://localhost:3000/auth/confirm?token_hash=abc123&type=email
```

### Check Browser Console
Open browser dev tools (F12) and check the console for any error messages.

### Test with Different Email
Try signing up with a different email address to test the flow.

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid confirmation link"
**Solution:** 
- Check that Site URL is set to `http://localhost:3000`
- Verify redirect URLs include `http://localhost:3000/**`
- Update email template with correct link format

### Issue 2: "Token expired"
**Solution:**
- Email confirmation links expire after 24 hours
- Try signing up again with a fresh email

### Issue 3: "Redirect URL mismatch"
**Solution:**
- Add `http://localhost:3000/**` to redirect URLs
- Make sure Site URL is exactly `http://localhost:3000`

### Issue 4: Email not received
**Solution:**
- Check spam folder
- Wait 2-3 minutes for delivery
- Try a different email provider (Gmail, Outlook, etc.)

## 🧪 Testing Checklist

- [ ] Supabase Site URL set to `http://localhost:3000`
- [ ] Redirect URLs include `http://localhost:3000/**`
- [ ] Email confirmation enabled
- [ ] Email template updated with correct link
- [ ] Development server running
- [ ] Test signup with new email
- [ ] Check email for confirmation link
- [ ] Click link and verify redirect
- [ ] Confirm success message appears
- [ ] Verify auto-redirect to main page

## 🎉 Expected Results

After fixing the configuration:

1. **Signup Process:**
   - Success modal appears
   - Clear email instructions shown

2. **Email Confirmation:**
   - Email received within 2-3 minutes
   - Confirmation link works properly
   - Redirects to confirmation page

3. **Confirmation Page:**
   - Shows "Email confirmed successfully!"
   - Auto-redirects to main page after 5 seconds
   - User can now log in normally

## 🔗 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/gbjvlaboflhkvlbkuram
- **Auth Settings**: https://supabase.com/dashboard/project/gbjvlaboflhkvlbkuram/auth/settings
- **Email Templates**: https://supabase.com/dashboard/project/gbjvlaboflhkvlbkuram/auth/templates

## 📞 Still Having Issues?

If you're still getting errors:

1. **Check the browser console** for detailed error messages
2. **Try a different email address** for testing
3. **Verify all Supabase settings** match the guide above
4. **Make sure the email template** uses the correct link format

The most common issue is the email template not having the correct link format. Make sure it uses:
```html
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

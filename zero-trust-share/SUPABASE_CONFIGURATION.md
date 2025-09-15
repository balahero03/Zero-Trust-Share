# Supabase Authentication Configuration Guide

## 🎯 Quick Setup for Development

### Step 1: Configure Supabase Dashboard Settings

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `gbjvlaboflhkvlbkuram`

2. **Authentication Settings**
   - Go to **Authentication > Settings**
   - Configure the following:

#### Site URL Configuration
```
Site URL: http://localhost:3000
```

#### Redirect URLs
```
Additional Redirect URLs: 
- http://localhost:3000/**
- http://localhost:3000/auth/callback
- http://localhost:3000/dashboard
```

#### Email Confirmation (Enable for Full Feature)
```
☑ Enable email confirmations (CHECK THIS)
```

3. **Save Changes**
   - Click **Save** at the bottom of the settings page

### Step 2: Database Schema Setup

1. **Go to SQL Editor**
   - Navigate to **SQL Editor** in your Supabase dashboard

2. **Run the Schema**
   - Copy the entire contents of `supabase-schema.sql`
   - Paste into the SQL Editor
   - Click **Run** to execute

### Step 3: Test Configuration

1. **Start Development Server**
   ```bash
   cd zero-trust-share
   npm run dev
   ```

2. **Test Authentication**
   - Open http://localhost:3000
   - Try signing up with a new account
   - Should work without email confirmation

## 🔧 Advanced Configuration

### Email Templates (Optional)
If you want to customize email templates:
- Go to **Authentication > Email Templates**
- Modify the confirmation email template
- Use `{{ .RedirectTo }}` instead of `{{ .SiteURL }}`

### OAuth Providers (Optional)
To add Google/GitHub login:
- Go to **Authentication > Providers**
- Enable desired providers
- Configure OAuth credentials

## 🚨 Troubleshooting

### "Invalid API Key" Error
- ✅ Fixed: API keys are now properly configured in `src/lib/supabase.ts`

### "Email Confirmation Required" Error
- ✅ Solution: Check your email and click the confirmation link
- ✅ Solution: The app now has a proper confirmation page at `/auth/confirm`

### "Redirect URL Mismatch" Error
- ✅ Solution: Add `http://localhost:3000/**` to redirect URLs

### "Database Connection Failed" Error
- ✅ Solution: Run the database schema in SQL Editor

## 📋 Configuration Checklist

- [ ] Site URL set to `http://localhost:3000`
- [ ] Redirect URLs include `http://localhost:3000/**`
- [ ] Email confirmation enabled
- [ ] Database schema executed
- [ ] Development server running
- [ ] Authentication tested

## 🎉 Success Indicators

When properly configured, you should see:
- ✅ No "invalid API key" errors
- ✅ Email confirmation flow working properly
- ✅ Success modal after signup with email instructions
- ✅ Email confirmation page at `/auth/confirm`
- ✅ Automatic redirect to main page after email confirmation
- ✅ Database operations working

## 🔒 Security Notes

- These settings are for **development only**
- For production, enable email confirmation
- Use HTTPS URLs in production
- Configure proper CORS policies
- Set up proper environment variables

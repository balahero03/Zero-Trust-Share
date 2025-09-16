# 👤 User Profile System Setup Guide

This guide will help you set up the new user profile system that stores user information (email, full name, mobile phone) in a dedicated `user_profiles` table.

## 🎯 What's New

- **Dedicated user_profiles table** - Stores user information separately from auth
- **Automatic profile creation** - Database trigger creates profiles for new users
- **Profile management API** - RESTful endpoints for profile operations
- **Profile management UI** - Modal component for users to view/edit their profiles
- **Migration support** - Script to migrate existing users

## 📋 Setup Steps

### Step 1: Update Database Schema

Run the updated schema in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of supabase-schema.sql
-- This will create the user_profiles table, triggers, and policies
```

**Key components added:**
- `user_profiles` table with proper relationships
- Database trigger `handle_new_user()` for automatic profile creation
- Row Level Security (RLS) policies
- Indexes for performance

### Step 2: Migrate Existing Users

Run the migration script to create profiles for existing users:

```bash
npm run migrate-users
```

This will:
- ✅ Fetch all existing users from auth.users
- ✅ Create corresponding profiles in user_profiles table
- ✅ Extract data from user metadata where available
- ✅ Skip users who already have profiles

### Step 3: Test New User Registration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test signup flow:**
   - Go to your app and create a new account
   - Include full name and phone number during signup
   - Check Supabase dashboard - user profile should be automatically created

### Step 4: Test Profile Management

Use the new `UserProfileModal` component to let users manage their profiles:

```typescript
import { UserProfileModal } from '@/components/UserProfileModal';

// In your component
const [showProfileModal, setShowProfileModal] = useState(false);

// Render the modal
<UserProfileModal
  isOpen={showProfileModal}
  onClose={() => setShowProfileModal(false)}
  onProfileUpdated={(profile) => {
    console.log('Profile updated:', profile);
  }}
/>
```

## 📊 Database Schema

### user_profiles Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key to auth.users(id) |
| `full_name` | text | User's full name |
| `email` | text | User's email address |
| `phone` | text | User's phone number (nullable) |
| `created_at` | timestamptz | Profile creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

### Automatic Profile Creation

The `handle_new_user()` trigger automatically creates a profile when a new user signs up:

```sql
-- Trigger extracts data from auth.users.raw_user_meta_data
-- Maps: full_name, phone from signup metadata
-- Uses: user.email for email field
```

## 🔧 API Endpoints

### GET /api/profile
Get current user's profile:
```javascript
const response = await fetch('/api/profile');
const { profile } = await response.json();
```

### PUT /api/profile
Update current user's profile:
```javascript
const response = await fetch('/api/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: 'New Name',
    phone: '+1234567890'
  })
});
```

### POST /api/profile
Create profile (rarely needed - trigger handles this):
```javascript
const response = await fetch('/api/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: 'John Doe',
    phone: '+1234567890'
  })
});
```

## 🛠️ Utility Functions

Use the profile utility functions in your components:

```typescript
import { getUserProfile, updateUserProfile } from '@/lib/profile-utils';

// Get current user's profile
const profile = await getUserProfile();

// Update profile
const updatedProfile = await updateUserProfile({
  full_name: 'New Name',
  phone: '+1234567890'
});
```

## 🔍 Verification Steps

### 1. Check Database Tables
In Supabase Dashboard → Table Editor:
- ✅ `user_profiles` table exists
- ✅ Sample profile data is present
- ✅ RLS policies are enabled

### 2. Check New User Flow
- ✅ Create new account with phone number
- ✅ Verify profile is automatically created
- ✅ Phone number is stored correctly

### 3. Check Existing Users
- ✅ Run migration script
- ✅ Verify existing users have profiles
- ✅ Check phone numbers are preserved

### 4. Check Profile Management
- ✅ Users can view their profile
- ✅ Users can edit full name and phone
- ✅ Changes are saved correctly

## 🚨 Troubleshooting

### Migration Issues
```bash
# If migration fails, check:
1. SUPABASE_SERVICE_ROLE_KEY is set in .env.local
2. Database schema has been applied
3. Check console for specific error messages
```

### Profile Not Creating
```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT * FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

### RLS Issues
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

## ✅ Success Indicators

You'll know the system is working when:

1. **New users** automatically get profiles with their signup data
2. **Existing users** can be migrated successfully
3. **Phone numbers** are properly stored and displayed
4. **Profile modal** allows users to view and edit their information
5. **API endpoints** respond correctly with user data

## 📱 Next Steps

- **Add phone verification** if needed
- **Enhance profile fields** (avatar, bio, etc.)
- **Add profile completeness indicators**
- **Implement profile-based features** (contact sharing, etc.)

The user profile system is now ready for production use! 🎉

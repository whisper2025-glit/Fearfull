# Fixing Clerk + Supabase Authentication Integration

## The Problem
Your recent chats aren't showing because Clerk authentication tokens aren't being properly passed to Supabase. This means:
- Conversations are created but not visible due to authentication issues
- Row Level Security (RLS) is disabled as a workaround
- Users can't see their own data properly

## The Solution

### Step 1: Configure Clerk for Supabase Integration

1. **In Clerk Dashboard:**
   - Go to your Clerk project dashboard
   - Navigate to **JWT Templates** 
   - Create a new template called "supabase"
   - Use this configuration:

```json
{
  "aud": "authenticated",
  "exp": {{ date.now | plus: 3600 }},
  "iat": {{ date.now }},
  "iss": "https://clerk.supabase.io",
  "sub": "{{ user.id }}",
  "role": "authenticated",
  "email": "{{ user.primary_email_address.email_address }}",
  "phone": "{{ user.primary_phone_number.phone_number }}",
  "app_metadata": {
    "provider": "clerk",
    "providers": ["clerk"]
  },
  "user_metadata": {
    "full_name": "{{ user.full_name }}",
    "avatar_url": "{{ user.profile_image_url }}"
  }
}
```

### Step 2: Configure Supabase for Clerk Integration

1. **In Supabase Dashboard:**
   - Go to **Settings > Authentication**
   - Find **Third-Party Auth** section
   - Click **Add Integration**
   - Select **Clerk**
   - Enter your Clerk domain (e.g., `your-app-name.clerk.accounts.dev`)

### Step 3: Update Environment Variables

Add to your `.env` file:
```bash
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Test the Integration

1. **Clear your browser data** (localStorage, cookies) for a clean test
2. **Sign out** if you're currently signed in
3. **Sign in again** with Clerk
4. **Try chatting** with a character
5. **Check the recent chats page** - you should now see your conversations!

### Step 5: Re-enable RLS Policies (Optional but Recommended)

Once the integration is working, you can re-enable Row Level Security:

1. Run this migration to re-enable RLS:

```sql
-- Re-enable RLS for better security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
```

## How to Verify It's Working

### In Browser Developer Tools:
1. Open Network tab
2. Sign in and chat with a character
3. Look for requests to Supabase with `Authorization: Bearer <token>` headers

### In Supabase Logs:
1. Go to Supabase Dashboard > Logs
2. Look for successful INSERT operations on conversations and messages tables

### Expected Behavior:
- ✅ Conversations appear in recent chats immediately after chatting
- ✅ Conversations persist between browser sessions
- ✅ Each user only sees their own conversations
- ✅ No authentication errors in console

## Troubleshooting

### If conversations still don't appear:
1. Check browser console for authentication errors
2. Verify Clerk JWT template is correctly configured
3. Ensure Supabase third-party auth is properly set up
4. Try clearing browser storage and signing in fresh

### If you get "unauthorized" errors:
1. Double-check the JWT template configuration
2. Verify the Clerk domain in Supabase settings
3. Ensure the `role` claim is set to "authenticated"

### If messages aren't being saved:
1. Check that `createOrUpdateUser()` is being called successfully
2. Verify user exists in the `users` table
3. Check for foreign key constraint errors

## Code Changes Made

The following files have been updated to use authenticated Supabase clients:

- ✅ `src/lib/supabase.ts` - Added Clerk token integration
- ✅ `src/hooks/useUserSync.ts` - Updated to use Clerk tokens
- ✅ `src/pages/Chat.tsx` - Uses authenticated Supabase client
- ✅ `src/pages/Chats.tsx` - Uses authenticated Supabase client

## Next Steps After Setup

1. Test the integration thoroughly
2. Consider re-enabling RLS policies for better security
3. Monitor for any authentication-related errors
4. Consider adding error handling for token refresh scenarios

---

**Need Help?**
If you continue to have issues, check:
- Clerk dashboard for JWT template configuration
- Supabase dashboard for third-party auth setup
- Browser console for authentication errors
- Network requests to ensure tokens are being sent

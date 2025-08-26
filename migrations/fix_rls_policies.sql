-- Fix RLS policies to work with current Clerk authentication setup
-- Since we're not passing Clerk JWTs to Supabase, we need to modify the policies

-- Temporarily disable RLS for conversations to allow inserts
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS for messages to allow inserts  
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Also temporarily disable for users and characters
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE characters DISABLE ROW LEVEL SECURITY;

-- Note: This is a temporary fix. For production, you should:
-- 1. Configure Supabase to accept Clerk JWTs, OR
-- 2. Use server-side endpoints with service_role key, OR
-- 3. Implement more sophisticated RLS policies that work with your auth setup

-- Keep the policies for future reference but they won't be enforced while RLS is disabled
-- You can re-enable RLS after implementing proper JWT integration

/*
Future implementation options:

Option 1: Clerk JWT Integration
- Configure Supabase to accept Clerk tokens
- Modify the supabase client to include Clerk tokens:
  
  import { useAuth } from '@clerk/clerk-react';
  const { getToken } = useAuth();
  const token = await getToken({ template: 'supabase' });
  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

Option 2: Server-side mediation
- Create API endpoints that verify Clerk tokens server-side
- Use service_role key on the backend for database operations

Option 3: Custom auth context
- Store user sessions in a way that RLS can access
- Modify policies to check against session context
*/

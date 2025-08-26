-- Re-enable RLS policies now that Clerk authentication is properly configured
-- Run this migration ONLY after completing the Clerk + Supabase integration setup

-- Re-enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Update policies to work with Clerk JWTs
-- Clerk JWTs will have 'sub' claim containing the user ID and 'role' claim set to 'authenticated'

-- Conversations policies (updated for Clerk)
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;

CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (
    user_id = auth.jwt()->>'sub' OR
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "Users can create their own conversations" ON conversations
  FOR INSERT WITH CHECK (
    user_id = auth.jwt()->>'sub' OR
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (
    user_id = auth.jwt()->>'sub' OR
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "Users can delete their own conversations" ON conversations
  FOR DELETE USING (
    user_id = auth.jwt()->>'sub' OR
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Messages policies (updated for Clerk)
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    author_id = auth.jwt()->>'sub' OR
    author_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = auth.jwt()->>'sub' OR 
            user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ) OR
    -- Allow viewing messages without conversation_id if user matches character owner or author
    (conversation_id IS NULL AND (
      author_id = auth.jwt()->>'sub' OR
      author_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
      character_id IN (
        SELECT id FROM characters 
        WHERE owner_id = auth.jwt()->>'sub' OR
              owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
      )
    ))
  );

CREATE POLICY "Users can insert messages to their conversations" ON messages
  FOR INSERT WITH CHECK (
    author_id = auth.jwt()->>'sub' OR
    author_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = auth.jwt()->>'sub' OR
            user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ) OR
    -- Allow inserting messages without conversation_id (for auto-creation)
    conversation_id IS NULL
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (
    author_id = auth.jwt()->>'sub' OR
    author_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = auth.jwt()->>'sub' OR
            user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (
    author_id = auth.jwt()->>'sub' OR
    author_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = auth.jwt()->>'sub' OR
            user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Characters policies (updated for Clerk)
DROP POLICY IF EXISTS "Anyone can view public characters" ON characters;
DROP POLICY IF EXISTS "Users can insert their own characters" ON characters;
DROP POLICY IF EXISTS "Users can update their own characters" ON characters;
DROP POLICY IF EXISTS "Users can delete their own characters" ON characters;

CREATE POLICY "Anyone can view public characters" ON characters
  FOR SELECT USING (
    visibility = 'public' 
    OR visibility = 'unlisted'
    OR (visibility = 'private' AND (
      owner_id = auth.jwt()->>'sub' OR
      owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ))
  );

CREATE POLICY "Users can insert their own characters" ON characters
  FOR INSERT WITH CHECK (
    owner_id = auth.jwt()->>'sub' OR
    owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "Users can update their own characters" ON characters
  FOR UPDATE USING (
    owner_id = auth.jwt()->>'sub' OR
    owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "Users can delete their own characters" ON characters
  FOR DELETE USING (
    owner_id = auth.jwt()->>'sub' OR
    owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Users policies (updated for Clerk)
DROP POLICY IF EXISTS "Users can view all user profiles" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users can view all user profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (
    id = auth.jwt()->>'sub' OR
    id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (
    id = auth.jwt()->>'sub' OR
    id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Create a helper function to get the current user ID from JWT
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt()->>'sub',
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the helper function
GRANT EXECUTE ON FUNCTION auth.user_id() TO authenticated, anon;

COMMENT ON MIGRATION IS 'Re-enable RLS policies with Clerk authentication support. Run after completing Clerk + Supabase integration setup.';

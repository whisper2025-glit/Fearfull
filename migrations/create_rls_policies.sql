-- Enable RLS on conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own conversations
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to insert their own conversations
CREATE POLICY "Users can create their own conversations" ON conversations
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to update their own conversations
CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to delete their own conversations
CREATE POLICY "Users can delete their own conversations" ON conversations
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Enable RLS on messages table if not already enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- Allow users to view messages from conversations they own
CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    author_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR 
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
    OR
    -- Allow viewing messages without conversation_id if user matches character owner or author
    (conversation_id IS NULL AND (
      author_id = current_setting('request.jwt.claims', true)::json->>'sub'
      OR character_id IN (
        SELECT id FROM characters 
        WHERE owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
      )
    ))
  );

-- Allow users to insert messages to conversations they own
CREATE POLICY "Users can insert messages to their conversations" ON messages
  FOR INSERT WITH CHECK (
    author_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
    OR
    -- Allow inserting messages without conversation_id (for auto-creation)
    conversation_id IS NULL
  );

-- Allow users to update their own messages
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (
    author_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Allow users to delete messages from their conversations
CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (
    author_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Also ensure characters table has proper RLS policies for viewing
-- (Users need to be able to see characters to load conversation details)
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Drop existing character policies if they exist
DROP POLICY IF EXISTS "Anyone can view public characters" ON characters;
DROP POLICY IF EXISTS "Users can view their own characters" ON characters;
DROP POLICY IF EXISTS "Users can insert their own characters" ON characters;
DROP POLICY IF EXISTS "Users can update their own characters" ON characters;
DROP POLICY IF EXISTS "Users can delete their own characters" ON characters;

-- Allow viewing public and unlisted characters, plus own private characters
CREATE POLICY "Anyone can view public characters" ON characters
  FOR SELECT USING (
    visibility = 'public' 
    OR visibility = 'unlisted'
    OR (visibility = 'private' AND owner_id = current_setting('request.jwt.claims', true)::json->>'sub')
  );

-- Allow users to manage their own characters
CREATE POLICY "Users can insert their own characters" ON characters
  FOR INSERT WITH CHECK (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own characters" ON characters
  FOR UPDATE USING (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own characters" ON characters
  FOR DELETE USING (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Enable RLS on users table and create policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing user policies if they exist
DROP POLICY IF EXISTS "Users can view all user profiles" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Allow viewing all user profiles (for author names, etc.)
CREATE POLICY "Users can view all user profiles" ON users
  FOR SELECT USING (true);

-- Allow users to manage their own profile
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

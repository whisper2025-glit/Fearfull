-- Adventure Chat History Migration for Supabase
-- Run this in your Supabase SQL Editor

-- Create adventure_conversations table (similar to conversations but for adventures)
CREATE TABLE IF NOT EXISTS adventure_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  adventure_id UUID NOT NULL, -- References adventures.id
  persona_id UUID NULL, -- References personas.id (optional)
  title TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE adventure_conversations 
ADD CONSTRAINT fk_adventure_conversations_adventure_id 
FOREIGN KEY (adventure_id) REFERENCES adventures(id) ON DELETE CASCADE;

-- Create adventure_messages table (similar to messages but for adventures)
CREATE TABLE IF NOT EXISTS adventure_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id UUID NOT NULL, -- References adventures.id
  conversation_id UUID NULL, -- References adventure_conversations.id
  author_id TEXT NULL, -- Clerk user ID for user messages, null for AI
  content TEXT NOT NULL,
  is_bot BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'regular' CHECK (type IN ('intro', 'scenario', 'regular', 'choice')),
  choices JSONB DEFAULT '[]'::jsonb, -- Store available choices for interactive messages
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraints for adventure_messages
ALTER TABLE adventure_messages 
ADD CONSTRAINT fk_adventure_messages_adventure_id 
FOREIGN KEY (adventure_id) REFERENCES adventures(id) ON DELETE CASCADE;

ALTER TABLE adventure_messages 
ADD CONSTRAINT fk_adventure_messages_conversation_id 
FOREIGN KEY (conversation_id) REFERENCES adventure_conversations(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_adventure_conversations_user_id ON adventure_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_adventure_conversations_adventure_id ON adventure_conversations(adventure_id);
CREATE INDEX IF NOT EXISTS idx_adventure_conversations_started_at ON adventure_conversations(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_adventure_conversations_last_message_at ON adventure_conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_adventure_messages_adventure_id ON adventure_messages(adventure_id);
CREATE INDEX IF NOT EXISTS idx_adventure_messages_conversation_id ON adventure_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_adventure_messages_author_id ON adventure_messages(author_id);
CREATE INDEX IF NOT EXISTS idx_adventure_messages_created_at ON adventure_messages(created_at DESC);

-- Add Row Level Security (RLS)
ALTER TABLE adventure_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for adventure_conversations
CREATE POLICY "Users can manage their own adventure conversations" 
ON adventure_conversations
FOR ALL 
USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Create RLS policies for adventure_messages
CREATE POLICY "Users can manage adventure messages in their conversations" 
ON adventure_messages
FOR ALL 
USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Function to update updated_at timestamp automatically for adventure_conversations
CREATE OR REPLACE FUNCTION update_adventure_conversations_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on adventure_conversations
DROP TRIGGER IF EXISTS update_adventure_conversations_updated_at ON adventure_conversations;
CREATE TRIGGER update_adventure_conversations_updated_at 
    BEFORE UPDATE ON adventure_conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_adventure_conversations_updated_at_column();

-- Function to update message count and last_message_at when new messages are added
CREATE OR REPLACE FUNCTION update_adventure_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update message count and last message time
    UPDATE adventure_conversations 
    SET 
        message_count = message_count + 1,
        last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update conversation stats when messages are added
DROP TRIGGER IF EXISTS update_adventure_conversation_stats_trigger ON adventure_messages;
CREATE TRIGGER update_adventure_conversation_stats_trigger
    AFTER INSERT ON adventure_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_adventure_conversation_stats();

-- Add comments for documentation
COMMENT ON TABLE adventure_conversations IS 'Stores conversation sessions for adventures';
COMMENT ON TABLE adventure_messages IS 'Stores individual messages within adventure conversations';

-- Verify the tables were created successfully
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('adventure_conversations', 'adventure_messages')
ORDER BY tablename;

-- Show table structure for adventure_conversations
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'adventure_conversations'
ORDER BY ordinal_position;

-- Show table structure for adventure_messages
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'adventure_messages'
ORDER BY ordinal_position;

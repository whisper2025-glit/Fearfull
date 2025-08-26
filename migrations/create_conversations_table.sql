-- Create conversations table for managing chat sessions
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  title TEXT, -- Optional conversation title
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}', -- For storing additional conversation data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add conversation_id to messages table
ALTER TABLE messages 
ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_character_id ON conversations(character_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Create a function to update last_message_at and message_count when messages are inserted
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE conversations 
    SET 
      last_message_at = NEW.created_at,
      message_count = message_count + 1,
      updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE conversations 
    SET 
      message_count = GREATEST(message_count - 1, 0),
      updated_at = NOW()
    WHERE id = OLD.conversation_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update conversation stats
CREATE TRIGGER trigger_update_conversation_stats_insert
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_stats();

CREATE TRIGGER trigger_update_conversation_stats_delete
  AFTER DELETE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_stats();

-- Create a function to automatically create a conversation when first message is sent
CREATE OR REPLACE FUNCTION create_conversation_if_needed()
RETURNS TRIGGER AS $$
DECLARE
  conv_id UUID;
  char_name TEXT;
BEGIN
  -- Only create conversation if conversation_id is null
  IF NEW.conversation_id IS NULL THEN
    -- Get character name for conversation title
    SELECT name INTO char_name FROM characters WHERE id = NEW.character_id;
    
    -- Create new conversation
    INSERT INTO conversations (user_id, character_id, title)
    VALUES (COALESCE(NEW.author_id, 'system'), NEW.character_id, 'Chat with ' || COALESCE(char_name, 'Character'))
    RETURNING id INTO conv_id;
    
    -- Update the message with the new conversation_id
    NEW.conversation_id = conv_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create conversations
CREATE TRIGGER trigger_create_conversation_if_needed
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_if_needed();

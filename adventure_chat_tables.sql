-- =============================================
-- ADVENTURE CHAT HISTORY TABLES FOR SUPABASE
-- =============================================
-- This script creates ONLY the missing adventure chat history tables
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- ADVENTURE CONVERSATIONS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS adventure_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    adventure_id UUID NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
    persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    title TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- ADVENTURE MESSAGES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS adventure_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adventure_id UUID NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES adventure_conversations(id) ON DELETE CASCADE,
    author_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- NULL for AI messages
    content TEXT NOT NULL,
    is_bot BOOLEAN DEFAULT TRUE,
    type TEXT DEFAULT 'regular' CHECK (type IN ('intro', 'scenario', 'regular', 'choice')),
    choices JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

-- Adventure conversation indexes
CREATE INDEX IF NOT EXISTS idx_adventure_conversations_user_id 
    ON adventure_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_adventure_conversations_adventure_id 
    ON adventure_conversations(adventure_id);
CREATE INDEX IF NOT EXISTS idx_adventure_conversations_last_message_at 
    ON adventure_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_adventure_conversations_is_archived 
    ON adventure_conversations(is_archived);

-- Adventure message indexes  
CREATE INDEX IF NOT EXISTS idx_adventure_messages_conversation_id 
    ON adventure_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_adventure_messages_adventure_id 
    ON adventure_messages(adventure_id);
CREATE INDEX IF NOT EXISTS idx_adventure_messages_created_at 
    ON adventure_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_adventure_messages_author_id 
    ON adventure_messages(author_id);

-- =========================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =========================================

-- Function to update timestamps (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to adventure_conversations
CREATE TRIGGER update_adventure_conversations_updated_at 
    BEFORE UPDATE ON adventure_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- TRIGGERS FOR MESSAGE COUNT UPDATES
-- =========================================

-- Function to update message count in adventure conversations
CREATE OR REPLACE FUNCTION update_adventure_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE adventure_conversations 
        SET message_count = message_count + 1,
            last_message_at = NOW()
        WHERE id = NEW.conversation_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE adventure_conversations 
        SET message_count = GREATEST(message_count - 1, 0)
        WHERE id = OLD.conversation_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply message count trigger
CREATE TRIGGER trigger_update_adventure_conversation_message_count
    AFTER INSERT OR DELETE ON adventure_messages
    FOR EACH ROW EXECUTE FUNCTION update_adventure_conversation_message_count();

-- =========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================

-- Enable RLS on adventure tables
ALTER TABLE adventure_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_messages ENABLE ROW LEVEL SECURITY;

-- Adventure conversations policies - users can only access their own
CREATE POLICY "Users can view their own adventure conversations" 
    ON adventure_conversations FOR SELECT 
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own adventure conversations" 
    ON adventure_conversations FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own adventure conversations" 
    ON adventure_conversations FOR UPDATE 
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own adventure conversations" 
    ON adventure_conversations FOR DELETE 
    USING (auth.uid()::text = user_id);

-- Adventure messages policies - users can view messages from their conversations
CREATE POLICY "Users can view adventure messages from their conversations" 
    ON adventure_messages FOR SELECT 
    USING (
        conversation_id IN (
            SELECT id FROM adventure_conversations 
            WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can create adventure messages in their conversations" 
    ON adventure_messages FOR INSERT 
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM adventure_conversations 
            WHERE user_id = auth.uid()::text
        ) OR
        author_id = auth.uid()::text
    );

-- =========================================
-- COMPLETION MESSAGE
-- =========================================
DO $$
BEGIN
    RAISE NOTICE '✅ ADVENTURE CHAT TABLES CREATED SUCCESSFULLY!';
    RAISE NOTICE '📊 Tables created:';
    RAISE NOTICE '   - adventure_conversations (for adventure chat sessions)';
    RAISE NOTICE '   - adventure_messages (for adventure chat messages)';
    RAISE NOTICE '🔐 RLS policies enabled for user data security';
    RAISE NOTICE '⚡ Indexes and triggers configured for performance';
    RAISE NOTICE '🎮 Your adventure chat history is now ready to use!';
END $$;

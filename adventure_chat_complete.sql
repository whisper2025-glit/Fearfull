-- =============================================
-- COMPLETE ADVENTURE CHAT HISTORY SETUP
-- =============================================
-- This script creates adventure chat tables with proper RLS policies
-- ALL USER REFERENCES USE user_id CONSISTENTLY
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
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- NULL for AI messages
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
CREATE INDEX IF NOT EXISTS idx_adventure_messages_user_id 
    ON adventure_messages(user_id);

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
-- ENABLE ROW LEVEL SECURITY
-- =========================================

-- Enable RLS on adventure tables
ALTER TABLE adventure_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_messages ENABLE ROW LEVEL SECURITY;

-- =========================================
-- DROP EXISTING POLICIES (CLEANUP)
-- =========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own adventure conversations" ON adventure_conversations;
DROP POLICY IF EXISTS "Users can create their own adventure conversations" ON adventure_conversations;
DROP POLICY IF EXISTS "Users can update their own adventure conversations" ON adventure_conversations;
DROP POLICY IF EXISTS "Users can delete their own adventure conversations" ON adventure_conversations;

DROP POLICY IF EXISTS "Users can view adventure messages from their conversations" ON adventure_messages;
DROP POLICY IF EXISTS "Users can create adventure messages in their conversations" ON adventure_messages;
DROP POLICY IF EXISTS "Users can update adventure messages in their conversations" ON adventure_messages;
DROP POLICY IF EXISTS "Users can delete adventure messages in their conversations" ON adventure_messages;

-- Also drop any policies with the new naming convention
DROP POLICY IF EXISTS "adventure_conversations_select_own" ON adventure_conversations;
DROP POLICY IF EXISTS "adventure_conversations_insert_own" ON adventure_conversations;
DROP POLICY IF EXISTS "adventure_conversations_update_own" ON adventure_conversations;
DROP POLICY IF EXISTS "adventure_conversations_delete_own" ON adventure_conversations;

DROP POLICY IF EXISTS "adventure_messages_select_own" ON adventure_messages;
DROP POLICY IF EXISTS "adventure_messages_insert_own" ON adventure_messages;
DROP POLICY IF EXISTS "adventure_messages_update_own" ON adventure_messages;
DROP POLICY IF EXISTS "adventure_messages_delete_own" ON adventure_messages;

-- =========================================
-- ADVENTURE_CONVERSATIONS RLS POLICIES
-- =========================================

-- Users can view their own adventure conversations
CREATE POLICY "adventure_conversations_select_own" 
    ON adventure_conversations 
    FOR SELECT 
    USING (auth.uid()::text = user_id);

-- Users can create their own adventure conversations
CREATE POLICY "adventure_conversations_insert_own" 
    ON adventure_conversations 
    FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own adventure conversations
CREATE POLICY "adventure_conversations_update_own" 
    ON adventure_conversations 
    FOR UPDATE 
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own adventure conversations
CREATE POLICY "adventure_conversations_delete_own" 
    ON adventure_conversations 
    FOR DELETE 
    USING (auth.uid()::text = user_id);

-- =========================================
-- ADVENTURE_MESSAGES RLS POLICIES
-- =========================================

-- Users can view adventure messages from their own conversations
CREATE POLICY "adventure_messages_select_own" 
    ON adventure_messages 
    FOR SELECT 
    USING (
        -- User owns the conversation
        conversation_id IN (
            SELECT id FROM adventure_conversations 
            WHERE user_id = auth.uid()::text
        )
        OR
        -- Or it's a message they authored (for user messages)
        user_id = auth.uid()::text
    );

-- Users can create adventure messages in their own conversations
CREATE POLICY "adventure_messages_insert_own" 
    ON adventure_messages 
    FOR INSERT 
    WITH CHECK (
        -- Must be in a conversation they own
        conversation_id IN (
            SELECT id FROM adventure_conversations 
            WHERE user_id = auth.uid()::text
        )
        AND
        (
            -- Either it's their own message
            user_id = auth.uid()::text
            OR
            -- Or it's an AI message (user_id is NULL and is_bot is true)
            (user_id IS NULL AND is_bot = true)
        )
    );

-- Users can update adventure messages they own or in their conversations
CREATE POLICY "adventure_messages_update_own" 
    ON adventure_messages 
    FOR UPDATE 
    USING (
        conversation_id IN (
            SELECT id FROM adventure_conversations 
            WHERE user_id = auth.uid()::text
        )
        AND
        (
            user_id = auth.uid()::text
            OR
            (user_id IS NULL AND is_bot = true)
        )
    )
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM adventure_conversations 
            WHERE user_id = auth.uid()::text
        )
        AND
        (
            user_id = auth.uid()::text
            OR
            (user_id IS NULL AND is_bot = true)
        )
    );

-- Users can delete adventure messages from their own conversations
CREATE POLICY "adventure_messages_delete_own" 
    ON adventure_messages 
    FOR DELETE 
    USING (
        conversation_id IN (
            SELECT id FROM adventure_conversations 
            WHERE user_id = auth.uid()::text
        )
    );

-- =========================================
-- VERIFY SETUP
-- =========================================

-- Verify RLS is enabled and policies exist
DO $$
DECLARE
    conversations_rls_enabled BOOLEAN;
    messages_rls_enabled BOOLEAN;
    conversations_policies_count INTEGER;
    messages_policies_count INTEGER;
BEGIN
    -- Check RLS enabled
    SELECT relrowsecurity INTO conversations_rls_enabled 
    FROM pg_class WHERE relname = 'adventure_conversations';
    
    SELECT relrowsecurity INTO messages_rls_enabled 
    FROM pg_class WHERE relname = 'adventure_messages';
    
    -- Count policies
    SELECT COUNT(*) INTO conversations_policies_count
    FROM pg_policies WHERE tablename = 'adventure_conversations';
    
    SELECT COUNT(*) INTO messages_policies_count
    FROM pg_policies WHERE tablename = 'adventure_messages';
    
    -- Verify everything is set up correctly
    IF NOT conversations_rls_enabled THEN
        RAISE EXCEPTION 'RLS not enabled on adventure_conversations';
    END IF;
    
    IF NOT messages_rls_enabled THEN
        RAISE EXCEPTION 'RLS not enabled on adventure_messages';
    END IF;
    
    IF conversations_policies_count < 4 THEN
        RAISE EXCEPTION 'Missing policies on adventure_conversations (expected 4, got %)', conversations_policies_count;
    END IF;
    
    IF messages_policies_count < 4 THEN
        RAISE EXCEPTION 'Missing policies on adventure_messages (expected 4, got %)', messages_policies_count;
    END IF;
    
    RAISE NOTICE '✅ RLS SETUP VERIFICATION PASSED!';
    RAISE NOTICE 'adventure_conversations: RLS=%, Policies=%', conversations_rls_enabled, conversations_policies_count;
    RAISE NOTICE 'adventure_messages: RLS=%, Policies=%', messages_rls_enabled, messages_policies_count;
END $$;

-- =========================================
-- COMPLETION MESSAGE
-- =========================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ADVENTURE CHAT HISTORY SETUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables created:';
    RAISE NOTICE '   ✅ adventure_conversations (with user_id)';
    RAISE NOTICE '   ✅ adventure_messages (with user_id)';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 RLS Security:';
    RAISE NOTICE '   ✅ Row Level Security enabled on both tables';
    RAISE NOTICE '   ✅ 4 policies per table (SELECT, INSERT, UPDATE, DELETE)';
    RAISE NOTICE '   ✅ All policies use user_id with Clerk auth.uid()';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Performance:';
    RAISE NOTICE '   ✅ Optimized indexes created';
    RAISE NOTICE '   ✅ Auto-update triggers configured';
    RAISE NOTICE '   ✅ Message count tracking enabled';
    RAISE NOTICE '';
    RAISE NOTICE '🎮 Your adventure chat history is ready!';
END $$;

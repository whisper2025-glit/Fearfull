-- =============================================
-- RLS POLICIES FOR ADVENTURE CHAT HISTORY
-- =============================================
-- This script sets up Row Level Security policies for adventure chat tables
-- ALL POLICIES USE user_id CONSISTENTLY WITH CLERK AUTH
-- Run this in your Supabase SQL Editor

-- =========================================
-- ENABLE RLS ON ADVENTURE TABLES
-- =========================================

-- Enable RLS on adventure conversations table
ALTER TABLE adventure_conversations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on adventure messages table  
ALTER TABLE adventure_messages ENABLE ROW LEVEL SECURITY;

-- =========================================
-- DROP EXISTING POLICIES (IF ANY)
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
-- VERIFY RLS SETUP
-- =========================================

-- Check that RLS is enabled
DO $$
BEGIN
    -- Check adventure_conversations RLS
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'adventure_conversations' 
        AND relrowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS not enabled on adventure_conversations table';
    END IF;

    -- Check adventure_messages RLS
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'adventure_messages' 
        AND relrowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS not enabled on adventure_messages table';
    END IF;

    RAISE NOTICE '✅ RLS ENABLED on both adventure tables';
END $$;

-- =========================================
-- COMPLETION MESSAGE
-- =========================================
DO $$
BEGIN
    RAISE NOTICE '🔐 ADVENTURE CHAT RLS POLICIES SETUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Policies created for adventure_conversations:';
    RAISE NOTICE '   ✅ SELECT: Users can view their own conversations';
    RAISE NOTICE '   ✅ INSERT: Users can create their own conversations';
    RAISE NOTICE '   ✅ UPDATE: Users can update their own conversations';
    RAISE NOTICE '   ✅ DELETE: Users can delete their own conversations';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Policies created for adventure_messages:';
    RAISE NOTICE '   ✅ SELECT: Users can view messages from their conversations';
    RAISE NOTICE '   ✅ INSERT: Users can create messages in their conversations';
    RAISE NOTICE '   ✅ UPDATE: Users can update messages in their conversations';
    RAISE NOTICE '   ✅ DELETE: Users can delete messages from their conversations';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 All policies use user_id consistently with Clerk auth';
    RAISE NOTICE '🔒 Adventure chat data is now secure and isolated per user';
END $$;

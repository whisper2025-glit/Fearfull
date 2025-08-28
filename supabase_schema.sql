-- =========================================
-- SUPABASE SCHEMA FOR ADVENTURE CHAT SYSTEM
-- =========================================
-- This script creates all required tables for the adventure roleplay chat system
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- USERS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Clerk user ID
    username TEXT UNIQUE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    bio TEXT,
    gender TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- CHARACTERS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    intro TEXT NOT NULL,
    scenario TEXT,
    greeting TEXT,
    personality TEXT,
    appearance TEXT,
    avatar_url TEXT,
    scene_url TEXT,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
    rating TEXT DEFAULT 'filtered' CHECK (rating IN ('filtered', 'unfiltered')),
    tags TEXT[],
    gender TEXT,
    age TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- PERSONAS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Non-binary')),
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- ADVENTURES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS adventures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    plot TEXT NOT NULL,
    introduction TEXT,
    adventure_image_url TEXT,
    background_image_url TEXT,
    adventure_type TEXT DEFAULT 'custom' CHECK (adventure_type IN ('mcp', 'custom')),
    source_story TEXT,
    mcp_settings TEXT,
    custom_settings TEXT,
    ai_instructions TEXT,
    story_summary TEXT,
    plot_essentials TEXT,
    story_cards JSONB,
    category TEXT,
    rating TEXT DEFAULT 'all-ages' CHECK (rating IN ('all-ages', 'teens', 'adults')),
    persona TEXT,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- CHARACTER CONVERSATIONS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
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
-- CHARACTER MESSAGES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    author_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- NULL for bot messages
    content TEXT NOT NULL,
    is_bot BOOLEAN DEFAULT FALSE,
    type TEXT DEFAULT 'regular' CHECK (type IN ('intro', 'scenario', 'regular')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- COMMENTS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- COMMENT LIKES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- =========================================
-- CHARACTER FAVORITES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS favorited (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, character_id)
);

-- =========================================
-- ADVENTURE FAVORITES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS favorited_adventures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    adventure_id UUID NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, adventure_id)
);

-- =========================================
-- CHAT SETTINGS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS chat_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL,
    temperature DECIMAL(3,2) DEFAULT 0.70,
    content_diversity DECIMAL(3,2) DEFAULT 0.05,
    max_tokens INTEGER DEFAULT 195,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, model_id)
);

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Character indexes
CREATE INDEX IF NOT EXISTS idx_characters_owner_id ON characters(owner_id);
CREATE INDEX IF NOT EXISTS idx_characters_visibility ON characters(visibility);
CREATE INDEX IF NOT EXISTS idx_characters_created_at ON characters(created_at DESC);

-- Adventure indexes
CREATE INDEX IF NOT EXISTS idx_adventures_owner_id ON adventures(owner_id);
CREATE INDEX IF NOT EXISTS idx_adventures_visibility ON adventures(visibility);
CREATE INDEX IF NOT EXISTS idx_adventures_category ON adventures(category);
CREATE INDEX IF NOT EXISTS idx_adventures_created_at ON adventures(created_at DESC);

-- Conversation indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_character_id ON conversations(character_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Adventure conversation indexes
CREATE INDEX IF NOT EXISTS idx_adventure_conversations_user_id ON adventure_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_adventure_conversations_adventure_id ON adventure_conversations(adventure_id);
CREATE INDEX IF NOT EXISTS idx_adventure_conversations_last_message_at ON adventure_conversations(last_message_at DESC);

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_character_id ON messages(character_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Adventure message indexes
CREATE INDEX IF NOT EXISTS idx_adventure_messages_conversation_id ON adventure_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_adventure_messages_adventure_id ON adventure_messages(adventure_id);
CREATE INDEX IF NOT EXISTS idx_adventure_messages_created_at ON adventure_messages(created_at);

-- Comment indexes
CREATE INDEX IF NOT EXISTS idx_comments_character_id ON comments(character_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Favorite indexes
CREATE INDEX IF NOT EXISTS idx_favorited_user_id ON favorited(user_id);
CREATE INDEX IF NOT EXISTS idx_favorited_character_id ON favorited(character_id);
CREATE INDEX IF NOT EXISTS idx_favorited_adventures_user_id ON favorited_adventures(user_id);
CREATE INDEX IF NOT EXISTS idx_favorited_adventures_adventure_id ON favorited_adventures(adventure_id);

-- =========================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =========================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adventures_updated_at BEFORE UPDATE ON adventures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adventure_conversations_updated_at BEFORE UPDATE ON adventure_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_settings_updated_at BEFORE UPDATE ON chat_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- TRIGGERS FOR MESSAGE COUNT UPDATES
-- =========================================

-- Function to update message count in conversations
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE conversations 
        SET message_count = message_count + 1,
            last_message_at = NOW()
        WHERE id = NEW.conversation_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE conversations 
        SET message_count = GREATEST(message_count - 1, 0)
        WHERE id = OLD.conversation_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

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

-- Apply message count triggers
CREATE TRIGGER trigger_update_conversation_message_count
    AFTER INSERT OR DELETE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count();

CREATE TRIGGER trigger_update_adventure_conversation_message_count
    AFTER INSERT OR DELETE ON adventure_messages
    FOR EACH ROW EXECUTE FUNCTION update_adventure_conversation_message_count();

-- =========================================
-- TRIGGERS FOR COMMENT COUNTS
-- =========================================

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update reply count for parent comment
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE comments 
            SET reply_count = reply_count + 1
            WHERE id = NEW.parent_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update reply count for parent comment
        IF OLD.parent_id IS NOT NULL THEN
            UPDATE comments 
            SET reply_count = GREATEST(reply_count - 1, 0)
            WHERE id = OLD.parent_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update like counts
CREATE OR REPLACE FUNCTION update_comment_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments 
        SET likes_count = likes_count + 1
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments 
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply comment count triggers
CREATE TRIGGER trigger_update_comment_counts
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_counts();

CREATE TRIGGER trigger_update_comment_like_counts
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_like_counts();

-- =========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorited ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorited_adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;

-- Users policies - users can manage their own data
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid()::text = id);

-- Characters policies - public read, owner write
CREATE POLICY "Anyone can view public characters" ON characters FOR SELECT USING (visibility = 'public' OR owner_id = auth.uid()::text);
CREATE POLICY "Users can create characters" ON characters FOR INSERT WITH CHECK (auth.uid()::text = owner_id);
CREATE POLICY "Users can update their own characters" ON characters FOR UPDATE USING (auth.uid()::text = owner_id);
CREATE POLICY "Users can delete their own characters" ON characters FOR DELETE USING (auth.uid()::text = owner_id);

-- Adventures policies - public read, owner write
CREATE POLICY "Anyone can view public adventures" ON adventures FOR SELECT USING (visibility = 'public' OR owner_id = auth.uid()::text);
CREATE POLICY "Users can create adventures" ON adventures FOR INSERT WITH CHECK (auth.uid()::text = owner_id);
CREATE POLICY "Users can update their own adventures" ON adventures FOR UPDATE USING (auth.uid()::text = owner_id);
CREATE POLICY "Users can delete their own adventures" ON adventures FOR DELETE USING (auth.uid()::text = owner_id);

-- Personas policies - users can only access their own personas
CREATE POLICY "Users can view their own personas" ON personas FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can create their own personas" ON personas FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own personas" ON personas FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete their own personas" ON personas FOR DELETE USING (auth.uid()::text = user_id);

-- Conversations policies - users can only access their own conversations
CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can create their own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own conversations" ON conversations FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete their own conversations" ON conversations FOR DELETE USING (auth.uid()::text = user_id);

-- Adventure conversations policies - users can only access their own
CREATE POLICY "Users can view their own adventure conversations" ON adventure_conversations FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can create their own adventure conversations" ON adventure_conversations FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own adventure conversations" ON adventure_conversations FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete their own adventure conversations" ON adventure_conversations FOR DELETE USING (auth.uid()::text = user_id);

-- Messages policies - users can view messages from their conversations
CREATE POLICY "Users can view messages from their conversations" ON messages FOR SELECT 
USING (
    conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can create messages in their conversations" ON messages FOR INSERT 
WITH CHECK (
    conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()::text) OR
    author_id = auth.uid()::text
);

-- Adventure messages policies - users can view messages from their adventure conversations
CREATE POLICY "Users can view adventure messages from their conversations" ON adventure_messages FOR SELECT 
USING (
    conversation_id IN (SELECT id FROM adventure_conversations WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can create adventure messages in their conversations" ON adventure_messages FOR INSERT 
WITH CHECK (
    conversation_id IN (SELECT id FROM adventure_conversations WHERE user_id = auth.uid()::text) OR
    author_id = auth.uid()::text
);

-- Comments policies - public read, authenticated write
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid()::text = author_id);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid()::text = author_id);

-- Comment likes policies
CREATE POLICY "Anyone can view comment likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own comment likes" ON comment_likes FOR ALL USING (auth.uid()::text = user_id);

-- Favorites policies - users can only manage their own favorites
CREATE POLICY "Users can view their own favorites" ON favorited FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can manage their own favorites" ON favorited FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view their own adventure favorites" ON favorited_adventures FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can manage their own adventure favorites" ON favorited_adventures FOR ALL USING (auth.uid()::text = user_id);

-- Chat settings policies - users can only access their own settings
CREATE POLICY "Users can view their own chat settings" ON chat_settings FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can manage their own chat settings" ON chat_settings FOR ALL USING (auth.uid()::text = user_id);

-- =========================================
-- COMPLETION MESSAGE
-- =========================================
DO $$
BEGIN
    RAISE NOTICE '✅ SCHEMA CREATION COMPLETE!';
    RAISE NOTICE '🎉 All tables, indexes, triggers, and RLS policies have been created successfully.';
    RAISE NOTICE '🔐 Your adventure chat history system is now ready with full security.';
    RAISE NOTICE '📱 The application can now store and retrieve chat history for both characters and adventures.';
END $$;

-- Complete Adventures & Favorites Migration for Supabase
-- Run this in your Supabase SQL Editor

-- First, create the adventures table
CREATE TABLE IF NOT EXISTS adventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL, -- Clerk user ID (references users.id)
  name TEXT NOT NULL,
  plot TEXT NOT NULL,
  introduction TEXT,
  adventure_image_url TEXT,
  background_image_url TEXT,
  adventure_type TEXT NOT NULL DEFAULT 'custom' CHECK (adventure_type IN ('mcp', 'custom')),
  source_story TEXT, -- For MCP server type
  mcp_settings TEXT, -- For MCP server type (JSON string)
  custom_settings TEXT, -- For custom type (JSON string)
  ai_instructions TEXT, -- For custom type
  story_summary TEXT, -- For custom type
  plot_essentials TEXT, -- For custom type
  story_cards JSONB, -- JSONB array of story card objects
  category TEXT,
  rating TEXT NOT NULL DEFAULT 'all-ages' CHECK (rating IN ('all-ages', 'teens', 'adults')),
  persona TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for adventures table
CREATE INDEX IF NOT EXISTS idx_adventures_owner_id ON adventures(owner_id);
CREATE INDEX IF NOT EXISTS idx_adventures_visibility ON adventures(visibility);
CREATE INDEX IF NOT EXISTS idx_adventures_category ON adventures(category);
CREATE INDEX IF NOT EXISTS idx_adventures_rating ON adventures(rating);
CREATE INDEX IF NOT EXISTS idx_adventures_created_at ON adventures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adventures_updated_at ON adventures(updated_at DESC);

-- Add Row Level Security (RLS) for adventures
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for adventures
CREATE POLICY "Public adventures are viewable by everyone" ON adventures
    FOR SELECT USING (visibility = 'public' OR auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Users can manage their own adventures" ON adventures
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Function to update updated_at timestamp automatically for adventures
CREATE OR REPLACE FUNCTION update_adventures_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on adventures
DROP TRIGGER IF EXISTS update_adventures_updated_at ON adventures;
CREATE TRIGGER update_adventures_updated_at 
    BEFORE UPDATE ON adventures 
    FOR EACH ROW 
    EXECUTE FUNCTION update_adventures_updated_at_column();

-- Now create the favorited_adventures table
CREATE TABLE IF NOT EXISTS favorited_adventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  adventure_id UUID NOT NULL, -- References adventures.id
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, adventure_id) -- Prevent duplicate favorites
);

-- Add foreign key constraint to adventures table
ALTER TABLE favorited_adventures 
ADD CONSTRAINT fk_favorited_adventures_adventure_id 
FOREIGN KEY (adventure_id) REFERENCES adventures(id) ON DELETE CASCADE;

-- Create indexes for favorited_adventures table
CREATE INDEX IF NOT EXISTS idx_favorited_adventures_user_id ON favorited_adventures(user_id);
CREATE INDEX IF NOT EXISTS idx_favorited_adventures_adventure_id ON favorited_adventures(adventure_id);
CREATE INDEX IF NOT EXISTS idx_favorited_adventures_created_at ON favorited_adventures(created_at DESC);

-- Add Row Level Security (RLS) for favorited_adventures
ALTER TABLE favorited_adventures ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for favorited_adventures
CREATE POLICY "Users can manage their own adventure favorites" 
ON favorited_adventures
FOR ALL 
USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Add comments for documentation
COMMENT ON TABLE adventures IS 'Stores user-created adventures and story scenarios';
COMMENT ON TABLE favorited_adventures IS 'Stores user favorites for adventures';

-- Insert sample adventure data (optional - uncomment if you want sample data)
-- INSERT INTO adventures (owner_id, name, plot, introduction, adventure_type, category, rating, visibility) 
-- VALUES (
--   'sample-user-id',
--   'The Lost Kingdom',
--   'Embark on an epic quest to find the lost kingdom of Eldoria and restore peace to the realm.',
--   'You stand at the edge of a mysterious forest, ancient maps in hand, ready to begin your journey...',
--   'custom',
--   'Fantasy',
--   'teens',
--   'public'
-- );

-- Verify the tables were created successfully
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('adventures', 'favorited_adventures')
ORDER BY tablename;

-- Show table structure for adventures
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'adventures'
ORDER BY ordinal_position;

-- Show table structure for favorited_adventures
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'favorited_adventures'
ORDER BY ordinal_position;

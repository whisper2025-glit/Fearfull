-- Adventure Story MCP Server - Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the required tables

-- Create adventure_contexts table
CREATE TABLE IF NOT EXISTS adventure_contexts (
  adventure_id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  current_arc TEXT,
  active_characters JSONB DEFAULT '[]'::jsonb,
  story_state JSONB DEFAULT '{
    "current_location": null,
    "time_period": null,
    "major_events": [],
    "character_relationships": {},
    "plot_points": [],
    "player_choices": [],
    "world_state": {}
  }'::jsonb,
  ai_context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create adventure_events table
CREATE TABLE IF NOT EXISTS adventure_events (
  id BIGSERIAL PRIMARY KEY,
  adventure_id TEXT NOT NULL REFERENCES adventure_contexts(adventure_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('choice', 'event', 'dialogue', 'system')),
  event_content TEXT NOT NULL,
  characters JSONB DEFAULT '[]'::jsonb,
  location TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create story_cache table for API response caching
CREATE TABLE IF NOT EXISTS story_cache (
  cache_key TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  cache_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_adventure_events_adventure_id ON adventure_events(adventure_id);
CREATE INDEX IF NOT EXISTS idx_adventure_events_timestamp ON adventure_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_adventure_events_type ON adventure_events(event_type);
CREATE INDEX IF NOT EXISTS idx_adventure_contexts_source ON adventure_contexts(source_name);
CREATE INDEX IF NOT EXISTS idx_adventure_contexts_updated ON adventure_contexts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_cache_source ON story_cache(source_name);
CREATE INDEX IF NOT EXISTS idx_story_cache_expires ON story_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_cache_key ON story_cache(cache_key);

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on adventure_contexts
DROP TRIGGER IF EXISTS update_adventure_contexts_updated_at ON adventure_contexts;
CREATE TRIGGER update_adventure_contexts_updated_at 
    BEFORE UPDATE ON adventure_contexts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add Row Level Security (RLS) policies for better security
ALTER TABLE adventure_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_cache ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their data
CREATE POLICY "Allow all operations for authenticated users" ON adventure_contexts
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow all operations for authenticated users" ON adventure_events
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow all operations for authenticated users" on story_cache
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Create a function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM story_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean cache (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-cache', '0 */6 * * *', 'SELECT cleanup_expired_cache();');

-- Insert some sample data (optional)
-- INSERT INTO adventure_contexts (adventure_id, source_name, active_characters, story_state) 
-- VALUES (
--   'sample-adventure-1',
--   'One Piece', 
--   '["Monkey D. Luffy", "Roronoa Zoro"]'::jsonb,
--   '{
--     "current_location": "Wano Country",
--     "time_period": "Post-Timeskip",
--     "major_events": ["Arrival at Wano", "Meeting Momonosuke"],
--     "character_relationships": {},
--     "plot_points": [],
--     "player_choices": [],
--     "world_state": {}
--   }'::jsonb
-- );

-- Verify the schema
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('adventure_contexts', 'adventure_events', 'story_cache');

-- Show table columns (replacing \d commands with standard SQL)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'adventure_contexts'
ORDER BY ordinal_position;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'adventure_events'
ORDER BY ordinal_position;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'story_cache'
ORDER BY ordinal_position;

-- Add comments for documentation
COMMENT ON TABLE adventure_contexts IS 'Stores adventure context and state for MCP server';
COMMENT ON TABLE adventure_events IS 'Stores timeline of events for each adventure';
COMMENT ON TABLE story_cache IS 'Caches API responses to reduce external API calls';

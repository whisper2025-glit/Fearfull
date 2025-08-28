-- Create adventures table for user-created adventures
CREATE TABLE IF NOT EXISTS adventures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(name) <= 100 AND length(name) > 0),
    plot TEXT NOT NULL CHECK (length(plot) > 0),
    introduction TEXT CHECK (length(introduction) <= 2000),
    adventure_image_url TEXT,
    background_image_url TEXT,
    adventure_type TEXT NOT NULL CHECK (adventure_type IN ('mcp', 'custom')) DEFAULT 'custom',
    source_story TEXT, -- For MCP server type
    mcp_settings TEXT, -- For MCP server type  
    custom_settings TEXT, -- For custom type
    ai_instructions TEXT, -- For custom type
    story_summary TEXT, -- For custom type
    plot_essentials TEXT, -- For custom type
    story_cards JSONB, -- Array of story card objects for custom type
    category TEXT CHECK (category IN ('fantasy', 'sci-fi', 'horror', 'romance', 'adventure', 'mystery', 'historical', 'modern', 'post-apocalyptic', 'cyberpunk', 'steampunk', 'other')),
    rating TEXT NOT NULL CHECK (rating IN ('all-ages', 'teens', 'adults')) DEFAULT 'all-ages',
    persona TEXT, -- Who the user plays as in the story
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')) DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_adventures_owner_id ON adventures(owner_id);
CREATE INDEX IF NOT EXISTS idx_adventures_category ON adventures(category);
CREATE INDEX IF NOT EXISTS idx_adventures_rating ON adventures(rating);
CREATE INDEX IF NOT EXISTS idx_adventures_visibility ON adventures(visibility);
CREATE INDEX IF NOT EXISTS idx_adventures_adventure_type ON adventures(adventure_type);
CREATE INDEX IF NOT EXISTS idx_adventures_created_at ON adventures(created_at DESC);

-- RLS policies for adventures
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;

-- Users can view public adventures and their own adventures
CREATE POLICY "Users can view public adventures" ON adventures
    FOR SELECT USING (visibility = 'public' OR auth.uid()::text = owner_id);

-- Users can only insert their own adventures
CREATE POLICY "Users can insert their own adventures" ON adventures
    FOR INSERT WITH CHECK (auth.uid()::text = owner_id);

-- Users can only update their own adventures
CREATE POLICY "Users can update their own adventures" ON adventures
    FOR UPDATE USING (auth.uid()::text = owner_id);

-- Users can only delete their own adventures
CREATE POLICY "Users can delete their own adventures" ON adventures
    FOR DELETE USING (auth.uid()::text = owner_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_adventures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_adventures_updated_at_trigger
    BEFORE UPDATE ON adventures
    FOR EACH ROW
    EXECUTE FUNCTION update_adventures_updated_at();

-- Create storage buckets for adventure images (if they don't exist)
-- Note: These need to be run with appropriate permissions
-- INSERT INTO storage.buckets (id, name, public) VALUES ('adventures', 'adventures', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('backgrounds', 'backgrounds', true) ON CONFLICT DO NOTHING;

-- Storage policies for adventure images
-- CREATE POLICY "Users can upload adventure images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'adventures' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Adventure images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'adventures');
-- CREATE POLICY "Users can update their adventure images" ON storage.objects FOR UPDATE USING (bucket_id = 'adventures' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their adventure images" ON storage.objects FOR DELETE USING (bucket_id = 'adventures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for background images  
-- CREATE POLICY "Users can upload background images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Background images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'backgrounds');
-- CREATE POLICY "Users can update their background images" ON storage.objects FOR UPDATE USING (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their background images" ON storage.objects FOR DELETE USING (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

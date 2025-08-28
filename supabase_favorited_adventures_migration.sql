-- Create favorited_adventures table for adventure favorites functionality
-- Run this in your Supabase SQL Editor

-- Create favorited_adventures table
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_favorited_adventures_user_id ON favorited_adventures(user_id);
CREATE INDEX IF NOT EXISTS idx_favorited_adventures_adventure_id ON favorited_adventures(adventure_id);
CREATE INDEX IF NOT EXISTS idx_favorited_adventures_created_at ON favorited_adventures(created_at DESC);

-- Add Row Level Security (RLS)
ALTER TABLE favorited_adventures ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for favorited_adventures
CREATE POLICY "Users can manage their own adventure favorites" 
ON favorited_adventures
FOR ALL 
USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Add comment for documentation
COMMENT ON TABLE favorited_adventures IS 'Stores user favorites for adventures';

-- Verify the table was created successfully
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'favorited_adventures'
ORDER BY ordinal_position;

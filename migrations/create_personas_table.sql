-- Create personas table for user-defined chat personas
CREATE TABLE IF NOT EXISTS personas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(name) <= 30 AND length(name) > 0),
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Non-binary')),
    description TEXT CHECK (length(description) <= 1500),
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add persona_id to conversations table to track which persona was used
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS persona_id UUID REFERENCES personas(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_personas_user_id ON personas(user_id);
CREATE INDEX IF NOT EXISTS idx_personas_user_default ON personas(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_conversations_persona_id ON conversations(persona_id);

-- RLS policies for personas
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own personas
CREATE POLICY "Users can view their own personas" ON personas
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own personas" ON personas
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own personas" ON personas
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own personas" ON personas
    FOR DELETE USING (auth.uid()::text = user_id);

-- Function to ensure only one default persona per user
CREATE OR REPLACE FUNCTION ensure_single_default_persona()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a persona as default, unset all other defaults for this user
    IF NEW.is_default = true THEN
        UPDATE personas 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain single default persona per user
CREATE TRIGGER ensure_single_default_persona_trigger
    BEFORE INSERT OR UPDATE ON personas
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_persona();

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_personas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_personas_updated_at_trigger
    BEFORE UPDATE ON personas
    FOR EACH ROW
    EXECUTE FUNCTION update_personas_updated_at();

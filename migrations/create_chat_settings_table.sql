
-- Create chat_settings table to store user chat preferences
CREATE TABLE IF NOT EXISTS public.chat_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    model_id TEXT NOT NULL DEFAULT 'default',
    temperature DECIMAL(3,2) NOT NULL DEFAULT 0.8 CHECK (temperature >= 0 AND temperature <= 1),
    content_diversity DECIMAL(3,2) NOT NULL DEFAULT 0.05 CHECK (content_diversity >= 0 AND content_diversity <= 1),
    max_tokens INTEGER NOT NULL DEFAULT 3000 CHECK (max_tokens >= 195 AND max_tokens <= 7000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure one settings record per user per model
    UNIQUE(user_id, model_id)
);

-- Enable RLS
ALTER TABLE public.chat_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own chat settings" ON public.chat_settings
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own chat settings" ON public.chat_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own chat settings" ON public.chat_settings
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own chat settings" ON public.chat_settings
    FOR DELETE USING (auth.uid()::text = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_settings_updated_at 
    BEFORE UPDATE ON public.chat_settings
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_settings_user_id ON public.chat_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_settings_user_model ON public.chat_settings(user_id, model_id);

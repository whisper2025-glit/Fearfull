
-- Add user preferences and onboarding completion tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create index for faster preference queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_preferences ON users USING GIN(preferences);

-- Update existing users to have onboarding_completed = true (assuming they're already using the app)
UPDATE users SET onboarding_completed = true WHERE onboarding_completed IS NULL OR onboarding_completed = false;

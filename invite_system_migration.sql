-- Invite System Migration
-- Run this in your Supabase SQL Editor

-- Add invite_code column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;

-- Create invites table to track invite usage
CREATE TABLE IF NOT EXISTS invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id text REFERENCES users(id) ON DELETE CASCADE,
  invitee_id text REFERENCES users(id) ON DELETE CASCADE,
  invite_code text NOT NULL,
  coins_awarded integer NOT NULL DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_invites_inviter_id ON invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invites_invitee_id ON invites(invitee_id);
CREATE INDEX IF NOT EXISTS idx_invites_invite_code ON invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_users_invite_code ON users(invite_code);

-- Function to generate unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result text := '';
  i integer := 0;
  code_exists boolean := true;
BEGIN
  -- Keep generating until we get a unique code
  WHILE code_exists LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if this code already exists
    SELECT EXISTS(SELECT 1 FROM users WHERE invite_code = result) INTO code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to process invite code usage
CREATE OR REPLACE FUNCTION process_invite_code_usage(p_invitee_id text, p_invite_code text)
RETURNS TABLE(inviter_id text, coins_awarded integer, success boolean) AS $$
DECLARE
  v_inviter_id text;
  v_invite_count integer;
  v_coins_to_award integer := 100;
  v_max_invites integer := 10;
BEGIN
  -- Find the inviter by invite code
  SELECT id INTO v_inviter_id 
  FROM users 
  WHERE invite_code = p_invite_code AND id != p_invitee_id;
  
  -- If no inviter found, return failure
  IF v_inviter_id IS NULL THEN
    RETURN QUERY SELECT NULL::text, 0, false;
    RETURN;
  END IF;
  
  -- Check if invitee already used an invite code
  IF EXISTS(SELECT 1 FROM invites WHERE invitee_id = p_invitee_id) THEN
    RETURN QUERY SELECT v_inviter_id, 0, false;
    RETURN;
  END IF;
  
  -- Check if inviter has reached max invites (10)
  SELECT COUNT(*) INTO v_invite_count FROM invites WHERE inviter_id = v_inviter_id;
  
  IF v_invite_count >= v_max_invites THEN
    RETURN QUERY SELECT v_inviter_id, 0, false;
    RETURN;
  END IF;
  
  -- Record the invite usage
  INSERT INTO invites (inviter_id, invitee_id, invite_code, coins_awarded)
  VALUES (v_inviter_id, p_invitee_id, p_invite_code, v_coins_to_award);
  
  -- Award coins to the inviter
  UPDATE users 
  SET coins = coins + v_coins_to_award 
  WHERE id = v_inviter_id;
  
  -- Return success
  RETURN QUERY SELECT v_inviter_id, v_coins_to_award, true;
END;
$$ LANGUAGE plpgsql;

-- Function to get invite stats for a user
CREATE OR REPLACE FUNCTION get_invite_stats(p_user_id text)
RETURNS TABLE(invite_code text, invites_used integer, max_invites integer) AS $$
DECLARE
  v_invite_code text;
  v_invites_used integer;
  v_max_invites integer := 10;
BEGIN
  -- Get user's invite code
  SELECT users.invite_code INTO v_invite_code FROM users WHERE id = p_user_id;
  
  -- Count how many people used this user's invite code
  SELECT COUNT(*) INTO v_invites_used FROM invites WHERE inviter_id = p_user_id;
  
  RETURN QUERY SELECT v_invite_code, v_invites_used, v_max_invites;
END;
$$ LANGUAGE plpgsql;

-- Generate invite codes for existing users who don't have one
UPDATE users 
SET invite_code = generate_invite_code() 
WHERE invite_code IS NULL OR invite_code = '';

-- Add RLS policies for invites table (if RLS is enabled)
-- Uncomment if you want to enable RLS
-- ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own invites" ON invites FOR SELECT USING (auth.jwt() ->> 'sub' = inviter_id OR auth.jwt() ->> 'sub' = invitee_id);
-- CREATE POLICY "System can insert invites" ON invites FOR INSERT WITH CHECK (true);

-- Whisper Coins Migration
-- Run this in your Supabase SQL Editor

-- Add coins column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS coins integer NOT NULL DEFAULT 0;

-- Create coin transactions table for audit trail
CREATE TABLE IF NOT EXISTS coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Create atomic increment function
CREATE OR REPLACE FUNCTION increment_user_coins(user_id uuid, coin_amount integer, transaction_reason text DEFAULT 'increment')
RETURNS integer AS $$
DECLARE
  new_balance integer;
BEGIN
  -- Update user coins atomically
  UPDATE users 
  SET coins = coins + coin_amount 
  WHERE id = user_id 
  RETURNING coins INTO new_balance;
  
  -- Insert transaction record
  INSERT INTO coin_transactions (user_id, delta, reason) 
  VALUES (user_id, coin_amount, transaction_reason);
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- Create atomic deduction function with balance check
CREATE OR REPLACE FUNCTION deduct_user_coins(user_id uuid, coin_amount integer, transaction_reason text DEFAULT 'deduct')
RETURNS integer AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  -- Get current balance with row lock
  SELECT coins INTO current_balance 
  FROM users 
  WHERE id = user_id 
  FOR UPDATE;
  
  -- Check if user exists
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check sufficient balance
  IF current_balance < coin_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Current: %, Required: %', current_balance, coin_amount;
  END IF;
  
  -- Update user coins atomically
  UPDATE users 
  SET coins = coins - coin_amount 
  WHERE id = user_id 
  RETURNING coins INTO new_balance;
  
  -- Insert transaction record
  INSERT INTO coin_transactions (user_id, delta, reason) 
  VALUES (user_id, -coin_amount, transaction_reason);
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coin_transactions(created_at);

-- Add RLS policies for coin_transactions (if RLS is enabled)
-- Uncomment if you want to enable RLS
-- ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own coin transactions" ON coin_transactions FOR SELECT USING (auth.jwt() ->> 'sub' = user_id::text);
-- CREATE POLICY "System can insert coin transactions" ON coin_transactions FOR INSERT WITH CHECK (true);

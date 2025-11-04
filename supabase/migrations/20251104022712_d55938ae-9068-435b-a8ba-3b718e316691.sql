-- Add premium flag and rating support to prompt_packs
ALTER TABLE prompt_packs
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;

-- Add subscription status to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_premium_member BOOLEAN NOT NULL DEFAULT false;

-- Create prompt_pack_ratings table
CREATE TABLE IF NOT EXISTS prompt_pack_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES prompt_packs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pack_id, user_id)
);

-- Enable RLS on prompt_pack_ratings
ALTER TABLE prompt_pack_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompt_pack_ratings
CREATE POLICY "Users can view all ratings"
ON prompt_pack_ratings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create ratings for installed packs"
ON prompt_pack_ratings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM user_installed_packs
    WHERE pack_id = prompt_pack_ratings.pack_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own ratings"
ON prompt_pack_ratings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
ON prompt_pack_ratings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Function to update prompt pack average rating
CREATE OR REPLACE FUNCTION update_prompt_pack_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE prompt_packs
  SET average_rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM prompt_pack_ratings
    WHERE pack_id = COALESCE(NEW.pack_id, OLD.pack_id)
  )
  WHERE id = COALESCE(NEW.pack_id, OLD.pack_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update rating on insert/update/delete
DROP TRIGGER IF EXISTS update_prompt_pack_rating_trigger ON prompt_pack_ratings;
CREATE TRIGGER update_prompt_pack_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON prompt_pack_ratings
FOR EACH ROW
EXECUTE FUNCTION update_prompt_pack_rating();

-- Update user_installed_packs policy to check premium status
DROP POLICY IF EXISTS "Users can install packs" ON user_installed_packs;
CREATE POLICY "Users can install packs"
ON user_installed_packs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM prompt_packs pp
    WHERE pp.id = pack_id
    AND pp.is_active = true
    AND (
      pp.is_premium = false
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND is_premium_member = true
      )
    )
  )
);
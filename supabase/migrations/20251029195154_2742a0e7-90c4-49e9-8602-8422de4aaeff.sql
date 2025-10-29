-- Fix the circular recursion between marketplace_items and marketplace_shares
-- The marketplace_shares SELECT policy must NOT query marketplace_items

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view shares for their items or shares with them" ON public.marketplace_shares;

-- Create a simple policy that doesn't create recursion
-- Users can see shares where they are the recipient or the sharer
CREATE POLICY "Users can view their shares"
  ON public.marketplace_shares
  FOR SELECT
  USING (
    shared_with_user_id = auth.uid() 
    OR shared_by = auth.uid()
  );
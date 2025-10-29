-- Fix infinite recursion in organization_members policies
-- Drop the problematic policy
DROP POLICY IF EXISTS "Members can view their organization memberships" ON public.organization_members;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Members can view their organization memberships"
  ON public.organization_members
  FOR SELECT
  USING (user_id = auth.uid());
-- Fix organization_members policies to avoid ANY recursion
-- The key is: policies on organization_members CANNOT query organization_members

-- Drop all existing policies on organization_members
DROP POLICY IF EXISTS "Members can view their organization memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Organization admins can manage members" ON public.organization_members;

-- Simple SELECT policy: users can only see their own memberships
CREATE POLICY "Users can view own memberships"
  ON public.organization_members
  FOR SELECT
  USING (user_id = auth.uid());

-- For management, allow super admins and the organization creator
-- We'll check the organizations table (which now has safe policies)
CREATE POLICY "Org creators can manage members"
  ON public.organization_members
  FOR ALL
  USING (
    has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.organizations
      WHERE organizations.id = organization_members.organization_id
      AND organizations.created_by = auth.uid()
    )
  );
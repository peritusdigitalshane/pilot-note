-- Fix the circular dependency by separating SELECT from other operations
-- on organization_members so SELECT never queries organizations

-- Drop the problematic "ALL" policy
DROP POLICY IF EXISTS "Org creators can manage members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.organization_members;

-- SELECT policy: simple, no recursion
CREATE POLICY "Users can view own memberships"
  ON public.organization_members
  FOR SELECT
  USING (user_id = auth.uid());

-- INSERT/UPDATE/DELETE policies can query organizations (not used during SELECT)
CREATE POLICY "Org creators can insert members"
  ON public.organization_members
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.organizations
      WHERE organizations.id = organization_members.organization_id
      AND organizations.created_by = auth.uid()
    )
  );

CREATE POLICY "Org creators can update members"
  ON public.organization_members
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.organizations
      WHERE organizations.id = organization_members.organization_id
      AND organizations.created_by = auth.uid()
    )
  );

CREATE POLICY "Org creators can delete members"
  ON public.organization_members
  FOR DELETE
  USING (
    has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.organizations
      WHERE organizations.id = organization_members.organization_id
      AND organizations.created_by = auth.uid()
    )
  );
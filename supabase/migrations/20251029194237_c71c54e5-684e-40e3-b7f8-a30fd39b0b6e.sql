-- Create security definer functions to avoid recursion

-- Function to check if user is a member of an organization
CREATE OR REPLACE FUNCTION public.is_organization_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
    AND organization_id = _org_id
  )
$$;

-- Function to check if user is an admin of an organization
CREATE OR REPLACE FUNCTION public.is_organization_admin(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
    AND organization_id = _org_id
    AND role = 'admin'
  )
$$;

-- Function to get user's organization IDs
CREATE OR REPLACE FUNCTION public.get_user_organization_ids(_user_id uuid)
RETURNS TABLE(organization_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = _user_id
$$;

-- Drop and recreate organization_members policies without recursion
DROP POLICY IF EXISTS "Organization admins can manage members" ON public.organization_members;

CREATE POLICY "Organization admins can manage members"
  ON public.organization_members
  FOR ALL
  USING (is_organization_admin(auth.uid(), organization_id));

-- Drop and recreate organizations policies without recursion
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
DROP POLICY IF EXISTS "Organization admins can update" ON public.organizations;

CREATE POLICY "Users can view organizations they belong to"
  ON public.organizations
  FOR SELECT
  USING (
    created_by = auth.uid() 
    OR is_organization_member(auth.uid(), id)
  );

CREATE POLICY "Organization admins can update"
  ON public.organizations
  FOR UPDATE
  USING (
    created_by = auth.uid() 
    OR is_organization_admin(auth.uid(), id)
  );

-- Drop and recreate marketplace_items policies without recursion
DROP POLICY IF EXISTS "Users can view accessible marketplace items" ON public.marketplace_items;

CREATE POLICY "Users can view accessible marketplace items"
  ON public.marketplace_items
  FOR SELECT
  USING (
    is_active = true 
    AND (
      visibility = 'public'
      OR created_by = auth.uid()
      OR (visibility = 'organization' AND organization_id IN (SELECT get_user_organization_ids(auth.uid())))
      OR EXISTS (
        SELECT 1 
        FROM marketplace_shares 
        WHERE item_id = marketplace_items.id 
        AND shared_with_user_id = auth.uid()
      )
    )
  );
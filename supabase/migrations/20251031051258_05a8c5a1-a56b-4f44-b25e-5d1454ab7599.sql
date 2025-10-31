-- Drop the existing SELECT policy for prompt_packs that's too restrictive
DROP POLICY IF EXISTS "Users can view accessible prompt packs" ON public.prompt_packs;

-- Create a new SELECT policy that allows super admins to see all packs
CREATE POLICY "Super admins can view all prompt packs" 
ON public.prompt_packs 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'));

-- Re-create the user SELECT policy for regular users
CREATE POLICY "Users can view accessible active prompt packs" 
ON public.prompt_packs 
FOR SELECT 
USING (
  (is_active = true) AND 
  (
    (visibility = 'public') OR 
    (created_by = auth.uid()) OR 
    (
      (visibility = 'organization') AND 
      (organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
      ))
    )
  )
);

-- Update prompt_pack_items policy to allow super admins to see all items
DROP POLICY IF EXISTS "Users can view items of active packs" ON public.prompt_pack_items;

-- Super admins can see all prompt pack items
CREATE POLICY "Super admins can view all prompt pack items" 
ON public.prompt_pack_items 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'));

-- Regular users can only see items from active packs they have access to
CREATE POLICY "Users can view items of accessible active packs" 
ON public.prompt_pack_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM prompt_packs 
    WHERE prompt_packs.id = prompt_pack_items.pack_id 
    AND prompt_packs.is_active = true
  ) AND 
  auth.uid() IS NOT NULL
);
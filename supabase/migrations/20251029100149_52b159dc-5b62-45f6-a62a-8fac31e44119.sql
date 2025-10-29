-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization members table
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create marketplace items table
CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  model_name TEXT NOT NULL,
  provider_id UUID NOT NULL REFERENCES public.llm_providers(id) ON DELETE CASCADE,
  knowledge_base_id UUID REFERENCES public.knowledge_bases(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'organization')),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  install_count INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketplace item shares table (for sharing with specific users)
CREATE TABLE public.marketplace_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(item_id, shared_with_user_id)
);

-- Create ratings table
CREATE TABLE public.marketplace_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(item_id, user_id)
);

-- Create user installs table
CREATE TABLE public.marketplace_installs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(item_id, user_id)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_installs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view organizations they belong to"
ON public.organizations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = organizations.id AND user_id = auth.uid()
  ) OR created_by = auth.uid()
);

CREATE POLICY "Organization admins can update"
ON public.organizations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  ) OR created_by = auth.uid()
);

CREATE POLICY "Users can create organizations"
ON public.organizations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- RLS Policies for organization members
CREATE POLICY "Members can view their organization memberships"
ON public.organization_members FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Organization admins can manage members"
ON public.organization_members FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
    AND om.role = 'admin'
  )
);

-- RLS Policies for marketplace items
CREATE POLICY "Users can view accessible marketplace items"
ON public.marketplace_items FOR SELECT
TO authenticated
USING (
  is_active = true AND (
    visibility = 'public' OR
    created_by = auth.uid() OR
    (visibility = 'organization' AND organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )) OR
    EXISTS (
      SELECT 1 FROM public.marketplace_shares
      WHERE item_id = marketplace_items.id AND shared_with_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create marketplace items"
ON public.marketplace_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own items"
ON public.marketplace_items FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own items"
ON public.marketplace_items FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- RLS Policies for marketplace shares
CREATE POLICY "Users can view shares for their items or shares with them"
ON public.marketplace_shares FOR SELECT
TO authenticated
USING (
  shared_with_user_id = auth.uid() OR
  shared_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.marketplace_items
    WHERE id = marketplace_shares.item_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Item owners can create shares"
ON public.marketplace_shares FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.marketplace_items
    WHERE id = marketplace_shares.item_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Share creators can delete shares"
ON public.marketplace_shares FOR DELETE
TO authenticated
USING (shared_by = auth.uid());

-- RLS Policies for ratings
CREATE POLICY "Users can view all ratings"
ON public.marketplace_ratings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create ratings for installed items"
ON public.marketplace_ratings FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.marketplace_installs
    WHERE item_id = marketplace_ratings.item_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own ratings"
ON public.marketplace_ratings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
ON public.marketplace_ratings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for installs
CREATE POLICY "Users can view own installs"
ON public.marketplace_installs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can install accessible items"
ON public.marketplace_installs FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.marketplace_items mi
    WHERE mi.id = marketplace_installs.item_id
    AND mi.is_active = true
    AND (
      mi.visibility = 'public' OR
      mi.created_by = auth.uid() OR
      (mi.visibility = 'organization' AND mi.organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )) OR
      EXISTS (
        SELECT 1 FROM public.marketplace_shares
        WHERE item_id = mi.id AND shared_with_user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can uninstall items"
ON public.marketplace_installs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_items_updated_at
BEFORE UPDATE ON public.marketplace_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_ratings_updated_at
BEFORE UPDATE ON public.marketplace_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update average rating
CREATE OR REPLACE FUNCTION update_marketplace_item_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE marketplace_items
  SET average_rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM marketplace_ratings
    WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
  )
  WHERE id = COALESCE(NEW.item_id, OLD.item_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to update average rating
CREATE TRIGGER update_rating_average
AFTER INSERT OR UPDATE OR DELETE ON public.marketplace_ratings
FOR EACH ROW
EXECUTE FUNCTION update_marketplace_item_rating();

-- Create function to update install count
CREATE OR REPLACE FUNCTION update_marketplace_install_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE marketplace_items
    SET install_count = install_count + 1
    WHERE id = NEW.item_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE marketplace_items
    SET install_count = GREATEST(install_count - 1, 0)
    WHERE id = OLD.item_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to update install count
CREATE TRIGGER update_install_count
AFTER INSERT OR DELETE ON public.marketplace_installs
FOR EACH ROW
EXECUTE FUNCTION update_marketplace_install_count();

-- Create indexes
CREATE INDEX idx_organization_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_organization_members_user ON public.organization_members(user_id);
CREATE INDEX idx_marketplace_items_visibility ON public.marketplace_items(visibility) WHERE is_active = true;
CREATE INDEX idx_marketplace_items_org ON public.marketplace_items(organization_id) WHERE visibility = 'organization';
CREATE INDEX idx_marketplace_shares_user ON public.marketplace_shares(shared_with_user_id);
CREATE INDEX idx_marketplace_ratings_item ON public.marketplace_ratings(item_id);
CREATE INDEX idx_marketplace_installs_user ON public.marketplace_installs(user_id);
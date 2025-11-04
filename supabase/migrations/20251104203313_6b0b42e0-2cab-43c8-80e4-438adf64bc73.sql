-- Drop the existing foreign key that points to auth.users
ALTER TABLE public.organization_members
DROP CONSTRAINT organization_members_user_id_fkey;

-- Add new foreign key that points to profiles.user_id instead
-- This allows PostgREST to detect the relationship for joins
ALTER TABLE public.organization_members
ADD CONSTRAINT organization_members_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;
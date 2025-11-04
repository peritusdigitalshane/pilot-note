-- Create a secure function to look up user_id by email for organization invites
-- This bypasses RLS but only returns the user_id (not sensitive profile data)
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id 
  FROM public.profiles 
  WHERE email = _email
  LIMIT 1;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO authenticated;
-- Update the handle_new_user function to not assign any role to new users
-- (except the first user who gets super_admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_count INTEGER;
BEGIN
  -- Insert profile for the new user
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Check if this is the first user
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- If this is the first user, assign super_admin role
  -- Otherwise, don't assign any role (users will have no access by default)
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
  END IF;
  
  RETURN NEW;
END;
$function$;
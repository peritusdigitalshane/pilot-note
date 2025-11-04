-- Allow super admins to update all profiles
CREATE POLICY "Super admins can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));
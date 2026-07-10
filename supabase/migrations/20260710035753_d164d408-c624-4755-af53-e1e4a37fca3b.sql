
-- Add narrow bootstrap policy: an authenticated user may insert their own admin role only if no admin exists yet
CREATE POLICY "Bootstrap first admin"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'admin'::public.app_role
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role)
  );

-- Rewrite claim_first_admin as SECURITY INVOKER so it's no longer a definer function
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  current_uid UUID := auth.uid();
BEGIN
  IF current_uid IS NULL THEN
    RAISE EXCEPTION 'Debes estar autenticado';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN FALSE;
  END IF;
  INSERT INTO public.user_roles (user_id, role)
    VALUES (current_uid, 'admin')
    ON CONFLICT DO NOTHING;
  RETURN TRUE;
END;
$$;

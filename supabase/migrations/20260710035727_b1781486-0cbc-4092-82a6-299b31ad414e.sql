
-- 1) Restrict profiles SELECT
DROP POLICY IF EXISTS "Profiles are viewable by everyone authenticated" ON public.profiles;
CREATE POLICY "Users see own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- 2) Move has_role to a private schema so it isn't exposed via PostgREST
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 3) Recreate all policies to use private.has_role, then drop the public one
-- profiles (recreate with private schema reference)
DROP POLICY IF EXISTS "Users see own profile" ON public.profiles;
CREATE POLICY "Users see own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR private.has_role(auth.uid(), 'admin'));

-- user_roles
DROP POLICY IF EXISTS "Users see own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Users see own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- products
DROP POLICY IF EXISTS "Admin/editor insert products" ON public.products;
DROP POLICY IF EXISTS "Admin/editor update products" ON public.products;
DROP POLICY IF EXISTS "Admin delete products" ON public.products;
CREATE POLICY "Admin/editor insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin/editor update products"
  ON public.products FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin delete products"
  ON public.products FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- distributors
DROP POLICY IF EXISTS "Admin/editor insert distributors" ON public.distributors;
DROP POLICY IF EXISTS "Admin/editor update distributors" ON public.distributors;
DROP POLICY IF EXISTS "Admin delete distributors" ON public.distributors;
CREATE POLICY "Admin/editor insert distributors"
  ON public.distributors FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin/editor update distributors"
  ON public.distributors FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin delete distributors"
  ON public.distributors FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- orders
DROP POLICY IF EXISTS "Admin/editor read orders" ON public.orders;
DROP POLICY IF EXISTS "Admin/editor update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin delete orders" ON public.orders;
CREATE POLICY "Admin/editor read orders"
  ON public.orders FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin/editor update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin delete orders"
  ON public.orders FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- announcements
DROP POLICY IF EXISTS "Anyone reads published announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin/editor insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin/editor update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin delete announcements" ON public.announcements;
CREATE POLICY "Anyone reads published announcements"
  ON public.announcements FOR SELECT
  USING (is_published = true OR private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin/editor insert announcements"
  ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin/editor update announcements"
  ON public.announcements FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin delete announcements"
  ON public.announcements FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- site_content
DROP POLICY IF EXISTS "Admin/editor manage site content" ON public.site_content;
CREATE POLICY "Admin/editor manage site content"
  ON public.site_content FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

-- 4) Drop the public.has_role now that nothing references it
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);


-- Endurecer SECURITY DEFINER: no exponer a anon/authenticated más de lo necesario
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
-- has_role sigue siendo llamable por authenticated (lo usan las políticas RLS)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Endurecer política de INSERT de orders (evita filas vacías)
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders with a name"
  ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (
    customer_name IS NOT NULL
    AND length(trim(customer_name)) >= 2
    AND (phone IS NOT NULL OR email IS NOT NULL OR message IS NOT NULL)
  );

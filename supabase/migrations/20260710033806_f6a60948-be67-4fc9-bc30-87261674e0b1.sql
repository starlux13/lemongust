
-- =====================================================
-- LEMON GUST - Schema completo
-- =====================================================

-- Roles enum + tabla
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- has_role security definer (evita recursividad RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger para crear profile al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger updated_at genérico
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- PRODUCTS (catálogo público)
-- =====================================================
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2),
  unit TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- DISTRIBUTORS
-- =====================================================
CREATE TABLE public.distributors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER distributors_updated_at BEFORE UPDATE ON public.distributors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- ORDERS / CONTACTS (pedidos y mensajes)
-- =====================================================
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  city TEXT,
  address TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'nuevo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- ANNOUNCEMENTS (foro / anuncios públicos)
-- =====================================================
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'noticia',
  is_published BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- SITE_CONTENT (textos editables de la landing)
-- =====================================================
CREATE TABLE public.site_content (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- GRANTS
-- =====================================================
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

GRANT SELECT ON public.distributors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.distributors TO authenticated;
GRANT ALL ON public.distributors TO service_role;

GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Profiles are viewable by everyone authenticated"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- user_roles: only admin can manage; users can see own
CREATE POLICY "Users see own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- products: public read active; admin/editor write
CREATE POLICY "Anyone reads products"
  ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin/editor insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin/editor update products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin delete products"
  ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- distributors
CREATE POLICY "Anyone reads distributors"
  ON public.distributors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin/editor insert distributors"
  ON public.distributors FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin/editor update distributors"
  ON public.distributors FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin delete distributors"
  ON public.distributors FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- orders: anyone can create (pedidos web), admin/editor manage
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin/editor read orders"
  ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin/editor update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin delete orders"
  ON public.orders FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- announcements: public read published; author or admin manage
CREATE POLICY "Anyone reads published announcements"
  ON public.announcements FOR SELECT TO anon, authenticated
  USING (is_published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin/editor insert announcements"
  ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin/editor update announcements"
  ON public.announcements FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admin delete announcements"
  ON public.announcements FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- site_content
CREATE POLICY "Anyone reads site content"
  ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin/editor manage site content"
  ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- =====================================================
-- SEED DATA
-- =====================================================
INSERT INTO public.site_content (key, value) VALUES
  ('hero', jsonb_build_object(
    'kicker', 'Del Caquetá para toda Colombia',
    'title', 'Cítricos Lemon Gust',
    'subtitle', 'Zumo de limón, limonadas, sorbetes y granizados 100% naturales. Empresa 100% caqueteña, ahora expandiéndose desde Villavicencio.',
    'cta_primary', 'Ver productos',
    'cta_secondary', 'Contactar'
  )),
  ('about', jsonb_build_object(
    'title', 'Sabor que nace de la tierra',
    'body', 'Somos una empresa familiar del Caquetá dedicada a llevar el sabor auténtico del limón a cada hogar. Ahora, con distribución autorizada en Villavicencio y el Meta, expandimos la tradición.'
  ));

INSERT INTO public.products (name, slug, description, price, unit, category, sort_order) VALUES
  ('Zumo de Limón 1L', 'zumo-limon-1l', '100% natural, sin conservantes. El sabor del Caquetá en cada gota.', 12000, 'bolsa 1L', 'zumos', 1),
  ('Zumo de Limón 500ml', 'zumo-limon-500ml', 'Formato personal, listo para usar en cocina o bebidas.', 7000, 'bolsa 500ml', 'zumos', 2),
  ('Limonada Natural', 'limonada-natural', 'Limonada fresca lista para servir, endulzada al punto justo.', 5000, 'vaso', 'limonadas', 3),
  ('Sorbete de Limón', 'sorbete-limon', 'Cremoso, refrescante, hecho con fruta real.', 6000, 'vaso', 'sorbetes', 4),
  ('Granizado de Limón', 'granizado-limon', 'Hielo raspado con nuestro zumo insignia.', 4000, 'vaso', 'granizados', 5),
  ('Cristales de Limón', 'cristales-limon', 'Concentrado deshidratado para restaurantes y hogares.', 15000, 'bolsa 250g', 'especiales', 6);

INSERT INTO public.distributors (name, city, region, phone, address, sort_order) VALUES
  ('Adriana Collazos Guevara', 'Villavicencio', 'Meta', '321 316 0021', 'Distribuidor autorizado', 1),
  ('Cítricos Lemon Gust (Fábrica)', 'Florencia', 'Caquetá', '320 841 3985', 'Pedidos directos desde fábrica', 2);

INSERT INTO public.announcements (title, slug, excerpt, content, category, is_published, published_at) VALUES
  ('¡Ya estamos en Villavicencio!', 'llegamos-a-villavicencio',
    'Lemon Gust expande su distribución al Meta con presencia oficial en Villavicencio.',
    'Nos complace anunciar que ahora contamos con distribución autorizada en Villavicencio, gracias a la alianza familiar con Adriana Collazos Guevara. Podrás encontrar todos nuestros productos frescos y realizar pedidos a domicilio.',
    'anuncio', true, now()),
  ('Nueva presentación: Cristales de Limón', 'cristales-de-limon',
    'Concentrado deshidratado ideal para restaurantes, bares y hogares exigentes.',
    'Lanzamos oficialmente nuestros Cristales de Limón, una presentación innovadora que conserva todo el sabor natural en un formato práctico y duradero. Perfecto para quienes valoran el sabor auténtico.',
    'producto', true, now() - interval '3 days');

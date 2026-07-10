import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Leaf, Sparkles, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import heroLime from "@/assets/hero-lime.jpg";
import originCaqueta from "@/assets/origin-caqueta.jpg";
import productZumo from "@/assets/product-zumo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cítricos Lemon Gust — Zumo de limón natural del Caquetá" },
      {
        name: "description",
        content:
          "Del Caquetá para toda Colombia. Zumo de limón, limonadas, sorbetes y granizados 100% naturales. Distribución oficial en Villavicencio.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: products } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: announcements } = useQuery({
    queryKey: ["announcements", "preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id,title,slug,excerpt,category,published_at,image_url")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: distributors } = useQuery({
    queryKey: ["distributors", "preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distributors")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO cinematográfico */}
      <section className="relative overflow-hidden bg-forest-gradient grain">
        <img
          src={heroLime}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          width={1920}
          height={1280}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-transparent"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-sun blur-3xl opacity-40 animate-glow"
        />

        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32 lg:pt-40 lg:pb-48">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-forest-foreground/10 border border-forest-foreground/20 backdrop-blur px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-citrus animate-fade-up">
              <Sparkles className="h-3 w-3" />
              Del Caquetá para el Meta
            </div>
            <h1 className="mt-6 text-display text-5xl sm:text-7xl lg:text-8xl text-forest-foreground text-balance animate-fade-up">
              El sabor auténtico del{" "}
              <span className="italic bg-citrus-gradient bg-clip-text text-transparent">
                limón real
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-lg text-forest-foreground/80 leading-relaxed animate-fade-up">
              Zumo de limón, limonadas, sorbetes y granizados{" "}
              <strong className="text-citrus font-semibold">100% naturales</strong>. Empresa
              caqueteña, ahora con distribución oficial en Villavicencio.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-up">
              <Button asChild size="lg" className="bg-citrus-gradient text-forest hover:opacity-90 shadow-glow rounded-full px-8 h-14 text-base">
                <Link to="/productos">
                  Ver catálogo <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-forest-foreground/30 bg-forest-foreground/5 text-forest-foreground hover:bg-forest-foreground/10 rounded-full px-8 h-14 text-base"
              >
                <Link to="/contacto">
                  Pedir domicilio
                </Link>
              </Button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg animate-fade-up">
              {[
                { k: "100%", v: "Natural" },
                { k: "2", v: "Ciudades" },
                { k: "6+", v: "Productos" },
              ].map((s) => (
                <div key={s.v} className="border-l-2 border-citrus/60 pl-4">
                  <div className="text-display text-3xl text-citrus">{s.k}</div>
                  <div className="text-xs uppercase tracking-widest text-forest-foreground/60">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Etiqueta decorativa flotante */}
          <div className="hidden lg:block absolute right-8 top-32 animate-float">
            <div className="rotate-6 rounded-2xl bg-sun p-6 shadow-glow ring-4 ring-citrus/20 w-64">
              <div className="text-[10px] uppercase tracking-widest text-forest/70">Producto insignia</div>
              <div className="mt-2 text-display text-2xl text-forest">Zumo de Limón</div>
              <div className="text-xs text-forest/70 mt-1">Para darle sabor a tu vida</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTOS grid */}
      <section id="productos" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] items-end mb-14">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-primary">Nuestro catálogo</div>
            <h2 className="mt-3 text-display text-4xl sm:text-5xl text-balance">
              Cada producto, un pedazo del Caquetá
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl lg:justify-self-end">
            Desde el zumo insignia hasta granizados frescos, cada receta lleva el sabor real de
            limones cultivados en la Amazonía colombiana.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(products ?? []).map((p, i) => (
            <Link
              key={p.id}
              to="/productos"
              className="group relative overflow-hidden rounded-3xl bg-card border border-border shadow-lift hover:shadow-elegant transition-all hover:-translate-y-1"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="aspect-[4/5] overflow-hidden bg-forest-gradient relative">
                <img
                  src={p.image_url || productZumo}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-forest/90 to-transparent" />
                <div className="absolute top-4 left-4 rounded-full bg-sun/95 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-widest text-forest font-bold">
                  {p.category}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-display text-2xl leading-tight">{p.name}</h3>
                    <div className="text-xs text-muted-foreground mt-1">{p.unit}</div>
                  </div>
                  {p.price != null && (
                    <div className="text-right shrink-0">
                      <div className="text-display text-xl text-primary">
                        {formatCurrency(Number(p.price))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12">
            <Link to="/productos">
              Ver catálogo completo <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* HISTORIA / ORIGEN */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-elegant">
                <img src={originCaqueta} alt="Cultivo en el Caquetá" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -right-6 rounded-2xl bg-sun p-5 shadow-glow max-w-[200px]">
                <div className="text-[10px] uppercase tracking-widest text-forest/70">Origen</div>
                <div className="text-display text-xl text-forest">Caquetá, Colombia</div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
                <Leaf className="h-3 w-3" /> Historia
              </div>
              <h2 className="mt-3 text-display text-4xl sm:text-5xl text-balance">
                Una familia, una tradición, un sabor
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Nacimos en el corazón de la Amazonía colombiana. Cada limón, cada gota de zumo, es
                el resultado del trabajo de familias campesinas que cultivan con dedicación.
              </p>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Hoy, con orgullo, extendemos ese sabor auténtico hasta el Meta, con distribución
                oficial en Villavicencio — y este es apenas el comienzo.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { title: "Sin conservantes", body: "Solo fruta real" },
                  { title: "Empresa familiar", body: "100% caqueteña" },
                  { title: "Envío rápido", body: "A domicilio" },
                  { title: "Distribuidores", body: "Villavicencio y Meta" },
                ].map((f) => (
                  <div key={f.title} className="rounded-2xl border border-border p-4 hover:bg-secondary transition">
                    <div className="text-display text-lg">{f.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{f.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DISTRIBUIDORES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-[0.25em] text-primary">Red de distribución</div>
          <h2 className="mt-3 text-display text-4xl sm:text-5xl">¿Dónde encontrarnos?</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {(distributors ?? []).map((d) => (
            <div key={d.id} className="group rounded-3xl bg-card border border-border p-8 shadow-lift hover:shadow-elegant transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary">
                    <MapPin className="h-3 w-3" /> {d.city}
                    {d.region && <span className="text-muted-foreground">· {d.region}</span>}
                  </div>
                  <h3 className="mt-2 text-display text-2xl truncate">{d.name}</h3>
                  {d.address && <div className="text-sm text-muted-foreground mt-1">{d.address}</div>}
                </div>
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sun shadow-glow">
                  <MapPin className="h-6 w-6 text-forest" />
                </div>
              </div>
              {d.phone && (
                <a href={`tel:${d.phone}`} className="mt-6 flex items-center gap-3 rounded-2xl bg-secondary p-4 hover:bg-accent transition">
                  <Phone className="h-5 w-5 text-primary" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Llamar / WhatsApp</div>
                    <div className="text-display text-xl text-primary truncate">{d.phone}</div>
                  </div>
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ANUNCIOS */}
      <section className="relative bg-forest-gradient text-forest-foreground grain py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-citrus">Últimas noticias</div>
              <h2 className="mt-3 text-display text-4xl sm:text-5xl text-forest-foreground">Foro & Anuncios</h2>
            </div>
            <Button asChild variant="outline" className="border-forest-foreground/30 bg-forest-foreground/5 text-forest-foreground hover:bg-forest-foreground/10 rounded-full">
              <Link to="/anuncios">Ver todos <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {(announcements ?? []).map((a) => (
              <Link
                key={a.id}
                to="/anuncios"
                className="group rounded-3xl bg-forest-foreground/5 backdrop-blur border border-forest-foreground/10 p-6 hover:bg-forest-foreground/10 transition-all hover:-translate-y-1"
              >
                <div className="inline-block rounded-full bg-citrus/20 text-citrus px-3 py-1 text-[10px] uppercase tracking-widest">
                  {a.category}
                </div>
                <h3 className="mt-4 text-display text-2xl text-forest-foreground group-hover:text-citrus transition">
                  {a.title}
                </h3>
                <p className="mt-3 text-sm text-forest-foreground/70 line-clamp-3">{a.excerpt}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-citrus">
                  Leer más <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-citrus-gradient p-16 shadow-elegant grain">
          <div aria-hidden className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-sun blur-3xl opacity-60" />
          <div className="relative">
            <h2 className="text-display text-4xl sm:text-6xl text-forest text-balance">
              ¿Listo para probar el sabor real?
            </h2>
            <p className="mt-4 text-lg text-forest/80 max-w-xl mx-auto">
              Haz tu pedido a domicilio y nosotros te lo llevamos.
            </p>
            <Button asChild size="lg" className="mt-8 bg-forest text-citrus hover:bg-forest/90 rounded-full px-10 h-14 text-base shadow-lift">
              <Link to="/contacto">
                Pedir ahora <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

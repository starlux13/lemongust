import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { formatCurrency } from "@/lib/format";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import productZumo from "@/assets/product-zumo.jpg";

export const Route = createFileRoute("/productos")({
  head: () => ({
    meta: [
      { title: "Productos — Cítricos Lemon Gust" },
      { name: "description", content: "Catálogo completo: zumo de limón, limonadas, sorbetes, granizados y cristales de limón 100% naturales." },
      { property: "og:title", content: "Catálogo Lemon Gust" },
      { property: "og:description", content: "Zumos, limonadas, sorbetes y granizados 100% naturales." },
    ],
  }),
  component: ProductosPage,
});

function ProductosPage() {
  const [cat, setCat] = useState<string>("todos");
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    (products ?? []).forEach((p) => set.add(p.category));
    return ["todos", ...Array.from(set)];
  }, [products]);

  const filtered = (products ?? []).filter((p) => cat === "todos" || p.category === cat);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden bg-forest-gradient text-forest-foreground grain">
        <div aria-hidden className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-sun blur-3xl opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="text-xs uppercase tracking-[0.25em] text-citrus">Catálogo completo</div>
          <h1 className="mt-3 text-display text-5xl sm:text-7xl text-balance max-w-3xl">
            Todos nuestros <span className="italic bg-citrus-gradient bg-clip-text text-transparent">productos naturales</span>
          </h1>
          <p className="mt-6 text-lg max-w-xl text-forest-foreground/80">
            Cada receta está pensada para llevar el sabor real del limón a tu mesa.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium capitalize transition-all border",
                cat === c
                  ? "bg-forest text-forest-foreground border-forest shadow-lift"
                  : "bg-card text-foreground/70 border-border hover:border-primary",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {isLoading && <div className="text-center text-muted-foreground py-20">Cargando…</div>}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <article key={p.id} className="group rounded-3xl bg-card border border-border overflow-hidden shadow-lift hover:shadow-elegant transition-all hover:-translate-y-1">
              <div className="aspect-[4/5] overflow-hidden bg-forest-gradient relative">
                <img src={p.image_url || productZumo} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 left-4 rounded-full bg-sun/95 px-3 py-1 text-[10px] uppercase tracking-widest text-forest font-bold">{p.category}</div>
              </div>
              <div className="p-6">
                <h3 className="text-display text-2xl">{p.name}</h3>
                <div className="text-xs text-muted-foreground mt-1">{p.unit}</div>
                <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>
                {p.price != null && (
                  <div className="mt-5 flex items-center justify-between">
                    <div className="text-display text-2xl text-primary">{formatCurrency(Number(p.price))}</div>
                    <a href="/contacto" className="rounded-full bg-citrus-gradient text-forest px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-glow hover:opacity-90 transition">Pedir</a>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-20">No hay productos en esta categoría.</div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

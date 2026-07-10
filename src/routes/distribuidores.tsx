import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/distribuidores")({
  head: () => ({
    meta: [
      { title: "Distribuidores — Cítricos Lemon Gust" },
      { name: "description", content: "Encuentra los distribuidores oficiales de Lemon Gust en Colombia. Villavicencio, Meta y Caquetá." },
      { property: "og:title", content: "Distribuidores oficiales — Lemon Gust" },
      { property: "og:description", content: "Distribución oficial de Lemon Gust en Villavicencio, Meta y Caquetá." },
    ],
  }),
  component: DistribuidoresPage,
});

function DistribuidoresPage() {
  const { data: distributors, isLoading } = useQuery({
    queryKey: ["distributors", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("distributors").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden bg-forest-gradient text-forest-foreground grain">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="text-xs uppercase tracking-[0.25em] text-citrus">Red de distribución</div>
          <h1 className="mt-3 text-display text-5xl sm:text-7xl text-balance max-w-3xl">
            Nuestros <span className="italic bg-citrus-gradient bg-clip-text text-transparent">distribuidores oficiales</span>
          </h1>
          <p className="mt-6 text-lg max-w-xl text-forest-foreground/80">
            Encuentra Lemon Gust cerca de ti — desde la fábrica en el Caquetá hasta Villavicencio y todo el Meta.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-16">
        {isLoading && <div className="text-center text-muted-foreground py-20">Cargando…</div>}

        <div className="grid gap-6 md:grid-cols-2">
          {(distributors ?? []).map((d) => (
            <div key={d.id} className="rounded-3xl bg-card border border-border p-8 shadow-lift hover:shadow-elegant transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary">
                    <MapPin className="h-3 w-3" /> {d.city}
                    {d.region && <span className="text-muted-foreground">· {d.region}</span>}
                  </div>
                  <h3 className="mt-2 text-display text-3xl truncate">{d.name}</h3>
                  {d.address && <div className="text-sm text-muted-foreground mt-2">{d.address}</div>}
                  {d.notes && <p className="text-sm text-muted-foreground mt-2">{d.notes}</p>}
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

        {!isLoading && (distributors ?? []).length === 0 && (
          <div className="text-center text-muted-foreground py-20">Todavía no hay distribuidores registrados.</div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

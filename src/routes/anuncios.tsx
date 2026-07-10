import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { formatDate } from "@/lib/format";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/anuncios")({
  head: () => ({
    meta: [
      { title: "Anuncios y noticias — Cítricos Lemon Gust" },
      { name: "description", content: "Foro de publicaciones, novedades y anuncios oficiales de Cítricos Lemon Gust." },
      { property: "og:title", content: "Anuncios — Lemon Gust" },
      { property: "og:description", content: "Novedades y publicaciones oficiales de Lemon Gust." },
    ],
  }),
  component: AnunciosPage,
});

function AnunciosPage() {
  const { data: items, isLoading } = useQuery({
    queryKey: ["announcements", "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden bg-forest-gradient text-forest-foreground grain">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="text-xs uppercase tracking-[0.25em] text-citrus">Foro & Anuncios</div>
          <h1 className="mt-3 text-display text-5xl sm:text-7xl text-balance max-w-3xl">
            Novedades del <span className="italic bg-citrus-gradient bg-clip-text text-transparent">mundo Lemon Gust</span>
          </h1>
          <p className="mt-6 text-lg max-w-xl text-forest-foreground/80">
            Publicaciones oficiales, lanzamientos y anuncios de la empresa.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-16">
        {isLoading && <div className="text-center text-muted-foreground py-20">Cargando…</div>}

        <div className="space-y-8">
          {(items ?? []).map((a) => (
            <article key={a.id} className="rounded-3xl bg-card border border-border overflow-hidden shadow-lift hover:shadow-elegant transition-all">
              {a.image_url && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={a.image_url} alt={a.title} loading="lazy" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="rounded-full bg-citrus/25 text-forest px-3 py-1 uppercase tracking-widest font-bold">{a.category}</span>
                  {a.published_at && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {formatDate(a.published_at)}
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-display text-3xl sm:text-4xl">{a.title}</h2>
                {a.excerpt && <p className="mt-3 text-lg text-muted-foreground">{a.excerpt}</p>}
                <div className="mt-6 prose prose-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">
                  {a.content}
                </div>
              </div>
            </article>
          ))}
        </div>

        {!isLoading && (items ?? []).length === 0 && (
          <div className="text-center text-muted-foreground py-20">Todavía no hay publicaciones.</div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

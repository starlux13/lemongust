import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

function NotFoundComponent() {
  return (
    <div className="min-h-screen grid place-items-center bg-hero grain p-6">
      <div className="max-w-md text-center rounded-3xl bg-card/90 backdrop-blur p-10 shadow-elegant">
        <div className="text-display text-8xl bg-citrus-gradient bg-clip-text text-transparent">404</div>
        <h2 className="mt-4 text-display text-2xl">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Lo que buscas no existe o se movió a otro lugar.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex rounded-full bg-citrus-gradient px-6 py-3 text-sm font-semibold text-forest shadow-lift hover:opacity-90 transition"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="max-w-md text-center rounded-3xl bg-card p-10 shadow-elegant">
        <h1 className="text-display text-2xl">Algo salió mal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Intenta recargar la página o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="rounded-full border border-input px-5 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cítricos Lemon Gust — Zumo de limón natural" },
      {
        name: "description",
        content:
          "Del Caquetá para toda Colombia. Zumo de limón, limonadas, sorbetes y granizados 100% naturales. Distribución oficial en Villavicencio.",
      },
      { name: "author", content: "Cítricos Lemon Gust S.A.S" },
      { property: "og:title", content: "Cítricos Lemon Gust — Zumo de limón natural" },
      {
        property: "og:description",
        content: "Del Caquetá para toda Colombia. Zumo de limón, limonadas, sorbetes y granizados 100% naturales. Distribución oficial en Villavicencio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#faf8f0" },
      { name: "twitter:title", content: "Cítricos Lemon Gust — Zumo de limón natural" },
      { name: "twitter:description", content: "Del Caquetá para toda Colombia. Zumo de limón, limonadas, sorbetes y granizados 100% naturales. Distribución oficial en Villavicencio." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/d552e68e-76bc-472f-966d-9359975c1328" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/d552e68e-76bc-472f-966d-9359975c1328" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Outlet />
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

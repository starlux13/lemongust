import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Inicio" },
  { to: "/productos", label: "Productos" },
  { to: "/distribuidores", label: "Distribuidores" },
  { to: "/anuncios", label: "Anuncios" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { session, canManage, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sun shadow-glow ring-2 ring-primary/30 transition-transform group-hover:scale-105">
            <span className="text-display text-lg font-bold text-forest">LG</span>
          </div>
          <div className="min-w-0">
            <div className="text-display text-lg leading-none">Lemon Gust</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Cítricos · Caquetá
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === n.to ? "text-primary" : "text-foreground/70",
              )}
            >
              {n.label}
              {pathname === n.to && (
                <span className="absolute inset-x-4 -bottom-0.5 h-0.5 bg-citrus-gradient rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <>
              {canManage && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin">
                    <Shield className="h-4 w-4" /> Admin
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => void signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link to="/auth">Ingresar</Link>
            </Button>
          )}
          <Button asChild size="sm" className="bg-citrus-gradient text-forest hover:opacity-90">
            <Link to="/contacto">Pedir domicilio</Link>
          </Button>
        </div>

        <button
          className="lg:hidden p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background">
          <div className="flex flex-col p-4 gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium",
                  pathname === n.to ? "bg-secondary text-primary" : "text-foreground/70",
                )}
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {session ? (
                <>
                  {canManage && (
                    <Button asChild variant="outline">
                      <Link to="/admin" onClick={() => setOpen(false)}>
                        <Shield className="h-4 w-4" /> Panel Admin
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => void signOut()}>
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/auth" onClick={() => setOpen(false)}>Ingresar</Link>
                </Button>
              )}
              <Button asChild className="bg-citrus-gradient text-forest">
                <Link to="/contacto" onClick={() => setOpen(false)}>Pedir domicilio</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

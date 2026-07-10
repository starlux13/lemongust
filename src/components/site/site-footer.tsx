import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Phone, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-forest-gradient text-forest-foreground grain">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-sun shadow-glow">
              <span className="text-display text-lg text-forest">LG</span>
            </div>
            <div>
              <div className="text-display text-2xl">Cítricos Lemon Gust</div>
              <div className="text-xs uppercase tracking-[0.25em] opacity-70">Empresa 100% Caqueteña</div>
            </div>
          </div>
          <p className="mt-6 max-w-md text-forest-foreground/80 leading-relaxed">
            Del corazón del Caquetá para toda Colombia. Zumo de limón, limonadas, sorbetes y
            granizados 100% naturales — ahora expandiéndonos desde Villavicencio.
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-4">Explorar</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/productos" className="hover:text-citrus transition">Productos</Link></li>
            <li><Link to="/distribuidores" className="hover:text-citrus transition">Distribuidores</Link></li>
            <li><Link to="/anuncios" className="hover:text-citrus transition">Anuncios</Link></li>
            <li><Link to="/contacto" className="hover:text-citrus transition">Pedidos</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-4">Contacto</div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 shrink-0 mt-0.5 text-citrus" />
              <div>
                <div>Fábrica: 320 841 3985</div>
                <div>Villavicencio: 321 316 0021</div>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-citrus" />
              <span>Caquetá · Meta · Colombia</span>
            </li>
            <li className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com/lemon.gust" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-sidebar-accent hover:bg-citrus hover:text-forest transition">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://facebook.com/lemon.gust" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-sidebar-accent hover:bg-citrus hover:text-forest transition">
                <Facebook className="h-4 w-4" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-forest-foreground/10">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs opacity-60 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} Cítricos Lemon Gust S.A.S · Todos los derechos reservados</span>
          <span>Del Caquetá para el Meta · Para darle sabor a tu vida</span>
        </div>
      </div>
    </footer>
  );
}

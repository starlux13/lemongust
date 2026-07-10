import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Phone, MapPin, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto y pedidos — Cítricos Lemon Gust" },
      { name: "description", content: "Haz tu pedido a domicilio o contáctanos. Servicio en Villavicencio, Meta y Caquetá." },
      { property: "og:title", content: "Pedidos y contacto — Lemon Gust" },
      { property: "og:description", content: "Solicita tu pedido a domicilio o contáctanos por WhatsApp." },
    ],
  }),
  component: ContactoPage,
});

function ContactoPage() {
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.customer_name.trim().length < 2) {
      toast.error("Ingresa tu nombre");
      return;
    }
    if (!form.phone && !form.email && !form.message) {
      toast.error("Déjanos un teléfono, correo o mensaje");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      customer_name: form.customer_name,
      phone: form.phone || null,
      email: form.email || null,
      city: form.city || null,
      address: form.address || null,
      message: form.message || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("No pudimos enviar tu mensaje. Intenta de nuevo.");
      console.error(error);
      return;
    }
    toast.success("¡Recibimos tu solicitud! Te contactamos pronto.");
    setForm({ customer_name: "", phone: "", email: "", city: "", address: "", message: "" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden bg-forest-gradient text-forest-foreground grain">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-xs uppercase tracking-[0.25em] text-citrus">Contacto & pedidos</div>
          <h1 className="mt-3 text-display text-5xl sm:text-7xl text-balance max-w-3xl">
            Pide tu <span className="italic bg-citrus-gradient bg-clip-text text-transparent">domicilio</span>
          </h1>
          <p className="mt-6 text-lg max-w-xl text-forest-foreground/80">
            ¡Haz tu pedido y nosotros te lo hacemos llegar!
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={submit} className="rounded-3xl bg-card border border-border p-8 lg:p-10 shadow-lift space-y-5">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-primary">Formulario</div>
            <h2 className="mt-2 text-display text-3xl">Cuéntanos qué necesitas</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input id="name" required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Ej. María Rodríguez" />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono / WhatsApp</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="320 000 0000" />
            </div>
            <div>
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tucorreo@ejemplo.com" />
            </div>
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Villavicencio" />
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Calle / carrera" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="message">Mensaje / pedido</Label>
              <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Ej. Quiero 2 bolsas de zumo de 1L y 3 limonadas" />
            </div>
          </div>

          <Button type="submit" size="lg" disabled={submitting} className="w-full bg-citrus-gradient text-forest hover:opacity-90 rounded-full h-14 text-base shadow-glow">
            {submitting ? "Enviando…" : "Enviar solicitud"}
          </Button>
        </form>

        <aside className="space-y-4">
          <a href="tel:3208413985" className="block group rounded-3xl bg-forest text-forest-foreground p-8 shadow-elegant hover:shadow-glow transition-all grain">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-sun shadow-glow mb-6">
              <Phone className="h-6 w-6 text-forest" />
            </div>
            <div className="text-xs uppercase tracking-[0.25em] text-citrus">Fábrica · Caquetá</div>
            <div className="text-display text-3xl mt-2 group-hover:text-citrus transition">320 841 3985</div>
          </a>

          <a href="tel:3213160021" className="block group rounded-3xl bg-card border border-border p-8 shadow-lift hover:shadow-elegant transition-all">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-sun shadow-glow mb-6">
              <MapPin className="h-6 w-6 text-forest" />
            </div>
            <div className="text-xs uppercase tracking-[0.25em] text-primary">Distribuidor · Villavicencio</div>
            <div className="text-display text-3xl mt-2 text-primary group-hover:text-primary-glow transition">321 316 0021</div>
            <div className="text-sm text-muted-foreground mt-2">Adriana Collazos Guevara</div>
          </a>

          <div className="rounded-3xl bg-secondary p-6 border border-border">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-1" />
              <div className="text-sm text-muted-foreground">
                Respondemos pedidos en horario laboral. Para atención inmediata, prefiere llamada o WhatsApp.
              </div>
            </div>
          </div>
        </aside>
      </div>

      <SiteFooter />
    </div>
  );
}

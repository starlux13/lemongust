import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Package,
  Users,
  MapPin,
  Megaphone,
  FileText,
  Plus,
  Trash2,
  Save,
  Shield,
  LogOut,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel de Administración — Lemon Gust" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { session, loading, canManage, isAdmin, signOut, user, roles } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("products");

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const noRoleYet = roles.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sun shadow-glow">
              <span className="text-display text-lg text-forest">LG</span>
            </Link>
            <div className="min-w-0">
              <div className="text-display text-lg leading-none">Panel Admin</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {roles.map((r) => (
              <Badge key={r} variant="secondary" className="capitalize">
                <Shield className="h-3 w-3 mr-1" /> {r}
              </Badge>
            ))}
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <ExternalLink className="h-4 w-4" /> Ver sitio
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {noRoleYet && (
          <div className="mb-6 rounded-2xl border border-accent bg-accent/30 p-6">
            <div className="text-display text-xl">Cuenta sin permisos aún</div>
            <p className="text-sm text-muted-foreground mt-1">
              Tu cuenta está creada pero todavía no tiene rol asignado. El primer usuario que quiera ser administrador puede autoasignarse el rol desde la pestaña <strong>Usuarios y roles</strong> (esta acción solo funciona si aún no hay ningún admin registrado).
            </p>
          </div>
        )}

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="products"><Package className="h-4 w-4 mr-2" />Productos</TabsTrigger>
            <TabsTrigger value="orders"><Users className="h-4 w-4 mr-2" />Pedidos</TabsTrigger>
            <TabsTrigger value="distributors"><MapPin className="h-4 w-4 mr-2" />Distribuidores</TabsTrigger>
            <TabsTrigger value="announcements"><Megaphone className="h-4 w-4 mr-2" />Anuncios</TabsTrigger>
            <TabsTrigger value="content"><FileText className="h-4 w-4 mr-2" />Contenido</TabsTrigger>
            {isAdmin && <TabsTrigger value="roles"><Shield className="h-4 w-4 mr-2" />Usuarios y roles</TabsTrigger>}
            {noRoleYet && <TabsTrigger value="roles"><Shield className="h-4 w-4 mr-2" />Usuarios y roles</TabsTrigger>}
          </TabsList>

          <TabsContent value="products"><ProductsAdmin canManage={canManage} isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="orders"><OrdersAdmin canManage={canManage} isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="distributors"><DistributorsAdmin canManage={canManage} isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="announcements"><AnnouncementsAdmin canManage={canManage} isAdmin={isAdmin} userId={user!.id} /></TabsContent>
          <TabsContent value="content"><ContentAdmin canManage={canManage} /></TabsContent>
          <TabsContent value="roles"><RolesAdmin isAdmin={isAdmin} currentUserId={user!.id} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ------------------------------- PRODUCTS ------------------------------- */
type Product = {
  id: string; name: string; slug: string; description: string | null;
  price: number | null; unit: string | null; category: string; image_url: string | null;
  sort_order: number; is_active: boolean;
};
const EMPTY_PRODUCT = { name: "", slug: "", description: "", price: "", unit: "", category: "general", image_url: "", sort_order: 0, is_active: true };

function ProductsAdmin({ canManage, isAdmin }: { canManage: boolean; isAdmin: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order");
      if (error) throw error;
      return data as Product[];
    },
  });
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: form.description || null,
      price: form.price ? Number(form.price) : null,
      unit: form.unit || null,
      category: form.category || "general",
      image_url: form.image_url || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    const { error } = editingId
      ? await supabase.from("products").update(payload).eq("id", editingId)
      : await supabase.from("products").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Producto actualizado" : "Producto creado");
    setForm(EMPTY_PRODUCT); setEditingId(null);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products", "featured"] });
    qc.invalidateQueries({ queryKey: ["products", "all"] });
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Producto eliminado");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  function edit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name, slug: p.slug, description: p.description ?? "",
      price: p.price?.toString() ?? "", unit: p.unit ?? "", category: p.category,
      image_url: p.image_url ?? "", sort_order: p.sort_order, is_active: p.is_active,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      {canManage && (
        <form onSubmit={save} className="rounded-2xl border border-border bg-card p-6 space-y-3 h-fit">
          <div className="text-display text-xl">{editingId ? "Editar producto" : "Nuevo producto"}</div>
          <div><Label>Nombre</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Precio (COP)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div><Label>Unidad</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="bolsa 1L" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Categoría</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>Orden</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
          </div>
          <div><Label>Descripción</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>URL imagen</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" /></div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            <Label>Activo (visible en el sitio)</Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1"><Save className="h-4 w-4" /> {editingId ? "Guardar" : "Crear"}</Button>
            {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(EMPTY_PRODUCT); }}>Cancelar</Button>}
          </div>
        </form>
      )}

      <div className="space-y-3">
        {isLoading && <div className="text-muted-foreground text-sm">Cargando…</div>}
        {(data ?? []).map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-display text-lg truncate">{p.name}</div>
                {!p.is_active && <Badge variant="outline">Inactivo</Badge>}
                <Badge variant="secondary" className="capitalize">{p.category}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{p.unit} · {p.price != null ? formatCurrency(Number(p.price)) : "sin precio"}</div>
              {p.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.description}</p>}
            </div>
            {canManage && (
              <div className="flex flex-col gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => edit(p)}>Editar</Button>
                {isAdmin && <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- ORDERS ------------------------------- */
function OrdersAdmin({ canManage, isAdmin }: { canManage: boolean; isAdmin: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }
  async function remove(id: string) {
    if (!confirm("¿Eliminar este pedido?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  if (!canManage) return <div className="text-muted-foreground">Necesitas rol de editor o admin.</div>;

  return (
    <div className="space-y-3">
      {isLoading && <div className="text-muted-foreground text-sm">Cargando…</div>}
      {(data ?? []).length === 0 && !isLoading && <div className="text-muted-foreground text-sm">No hay pedidos.</div>}
      {(data ?? []).map((o) => (
        <div key={o.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-display text-lg">{o.customer_name}</div>
                <Badge variant={o.status === "nuevo" ? "default" : "secondary"} className={cn(o.status === "nuevo" && "bg-citrus text-forest")}>{o.status}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{formatDate(o.created_at)}</div>
              <div className="mt-2 text-sm space-y-0.5">
                {o.phone && <div>📞 <a href={`tel:${o.phone}`} className="text-primary hover:underline">{o.phone}</a></div>}
                {o.email && <div>✉️ <a href={`mailto:${o.email}`} className="text-primary hover:underline">{o.email}</a></div>}
                {(o.city || o.address) && <div>📍 {[o.city, o.address].filter(Boolean).join(", ")}</div>}
              </div>
              {o.message && <p className="mt-3 text-sm bg-secondary rounded-lg p-3 whitespace-pre-wrap">{o.message}</p>}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="contactado">Contactado</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              {isAdmin && <Button size="sm" variant="ghost" onClick={() => remove(o.id)}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- DISTRIBUTORS ------------------------------- */
function DistributorsAdmin({ canManage, isAdmin }: { canManage: boolean; isAdmin: boolean }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-distributors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("distributors").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
  const EMPTY = { name: "", city: "", region: "", phone: "", address: "", notes: "", sort_order: 0, is_active: true };
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
    const { error } = editingId
      ? await supabase.from("distributors").update(payload).eq("id", editingId)
      : await supabase.from("distributors").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Guardado");
    setForm(EMPTY); setEditingId(null);
    qc.invalidateQueries({ queryKey: ["admin-distributors"] });
    qc.invalidateQueries({ queryKey: ["distributors", "preview"] });
    qc.invalidateQueries({ queryKey: ["distributors", "all"] });
  }
  async function remove(id: string) {
    if (!confirm("¿Eliminar?")) return;
    const { error } = await supabase.from("distributors").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-distributors"] });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      {canManage && (
        <form onSubmit={save} className="rounded-2xl border border-border bg-card p-6 space-y-3 h-fit">
          <div className="text-display text-xl">{editingId ? "Editar" : "Nuevo"} distribuidor</div>
          <div><Label>Nombre</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Ciudad</Label><Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div><Label>Región</Label><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></div>
          </div>
          <div><Label>Teléfono</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Dirección</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><Label>Notas</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            <Label>Activo</Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1"><Save className="h-4 w-4" /> Guardar</Button>
            {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancelar</Button>}
          </div>
        </form>
      )}
      <div className="space-y-3">
        {(data ?? []).map((d) => (
          <div key={d.id} className="rounded-2xl border border-border bg-card p-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-display text-lg">{d.name}</div>
              <div className="text-xs text-muted-foreground">{d.city} · {d.region}</div>
              <div className="text-sm mt-1">{d.phone} · {d.address}</div>
              {!d.is_active && <Badge variant="outline" className="mt-2">Inactivo</Badge>}
            </div>
            {canManage && (
              <div className="flex flex-col gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => { setEditingId(d.id); setForm({ name: d.name, city: d.city, region: d.region ?? "", phone: d.phone ?? "", address: d.address ?? "", notes: d.notes ?? "", sort_order: d.sort_order, is_active: d.is_active }); }}>Editar</Button>
                {isAdmin && <Button size="sm" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4" /></Button>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- ANNOUNCEMENTS ------------------------------- */
function AnnouncementsAdmin({ canManage, isAdmin, userId }: { canManage: boolean; isAdmin: boolean; userId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const EMPTY = { title: "", slug: "", excerpt: "", content: "", category: "noticia", image_url: "", is_published: true };
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      image_url: form.image_url || null,
      published_at: form.is_published ? new Date().toISOString() : null,
      author_id: editingId ? undefined : userId,
    };
    const { error } = editingId
      ? await supabase.from("announcements").update(payload).eq("id", editingId)
      : await supabase.from("announcements").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Guardado");
    setForm(EMPTY); setEditingId(null);
    qc.invalidateQueries({ queryKey: ["admin-announcements"] });
    qc.invalidateQueries({ queryKey: ["announcements", "preview"] });
    qc.invalidateQueries({ queryKey: ["announcements", "list"] });
  }
  async function remove(id: string) {
    if (!confirm("¿Eliminar?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-announcements"] });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      {canManage && (
        <form onSubmit={save} className="rounded-2xl border border-border bg-card p-6 space-y-3 h-fit">
          <div className="text-display text-xl">{editingId ? "Editar" : "Nuevo"} anuncio</div>
          <div><Label>Título</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Resumen</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
          <div><Label>Contenido</Label><Textarea rows={6} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Categoría</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="noticia">Noticia</SelectItem>
                  <SelectItem value="anuncio">Anuncio</SelectItem>
                  <SelectItem value="producto">Producto</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="foro">Foro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>URL imagen</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
            <Label>Publicado</Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1"><Save className="h-4 w-4" /> Guardar</Button>
            {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancelar</Button>}
          </div>
        </form>
      )}
      <div className="space-y-3">
        {(data ?? []).map((a) => (
          <div key={a.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-display text-lg">{a.title}</div>
                  <Badge variant="secondary" className="capitalize">{a.category}</Badge>
                  {!a.is_published && <Badge variant="outline">Borrador</Badge>}
                </div>
                {a.excerpt && <p className="text-sm text-muted-foreground mt-1">{a.excerpt}</p>}
                <div className="text-xs text-muted-foreground mt-2">{formatDate(a.created_at)}</div>
              </div>
              {canManage && (
                <div className="flex flex-col gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => { setEditingId(a.id); setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt ?? "", content: a.content, category: a.category, image_url: a.image_url ?? "", is_published: a.is_published }); }}>Editar</Button>
                  {isAdmin && <Button size="sm" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- CONTENT ------------------------------- */
function ContentAdmin({ canManage }: { canManage: boolean }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("*");
      if (error) throw error;
      return data;
    },
  });

  if (!canManage) return <div className="text-muted-foreground">Necesitas rol de editor o admin.</div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Edita las secciones dinámicas del sitio en formato JSON.</p>
      {(data ?? []).map((row) => (
        <ContentRow key={row.key} rowKey={row.key} initialValue={row.value} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-content"] })} />
      ))}
    </div>
  );
}
function ContentRow({ rowKey, initialValue, onSaved }: { rowKey: string; initialValue: unknown; onSaved: () => void }) {
  const [txt, setTxt] = useState(JSON.stringify(initialValue, null, 2));
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      const value = JSON.parse(txt);
      const { error } = await supabase.from("site_content").update({ value }).eq("key", rowKey);
      if (error) throw error;
      toast.success(`Sección "${rowKey}" actualizada`);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "JSON inválido");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-display text-lg capitalize">{rowKey}</div>
        <Button size="sm" onClick={save} disabled={busy}><Save className="h-4 w-4" /> Guardar</Button>
      </div>
      <Textarea rows={10} className="font-mono text-xs" value={txt} onChange={(e) => setTxt(e.target.value)} />
    </div>
  );
}

/* ------------------------------- ROLES ------------------------------- */
function RolesAdmin({ isAdmin, currentUserId }: { isAdmin: boolean; currentUserId: string }) {
  const qc = useQueryClient();
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: roles } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });
  const { data: anyAdmin } = useQuery({
    queryKey: ["any-admin"],
    queryFn: async () => {
      const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
      return (count ?? 0) > 0;
    },
  });

  async function claimAdmin() {
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) { toast.error(error.message); return; }
    if (!data) { toast.error("Ya existe un administrador. Pídele que te asigne el rol."); return; }
    toast.success("¡Ahora eres administrador! Recargando…");
    setTimeout(() => window.location.reload(), 800);
  }

  async function toggleRole(userId: string, role: "admin" | "editor" | "user", enable: boolean) {
    if (enable) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) { toast.error(error.message); return; }
    }
    qc.invalidateQueries({ queryKey: ["admin-roles"] });
  }

  function hasRole(userId: string, role: string) {
    return (roles ?? []).some((r) => r.user_id === userId && r.role === role);
  }

  return (
    <div className="space-y-4">
      {!isAdmin && !anyAdmin && (
        <div className="rounded-2xl border border-citrus bg-citrus/20 p-6">
          <div className="text-display text-lg">Aún no hay administradores</div>
          <p className="text-sm text-muted-foreground mt-1">Puedes reclamar el rol de administrador (solo el primer usuario puede hacerlo).</p>
          <Button className="mt-3 bg-forest text-forest-foreground" onClick={claimAdmin}>Convertirme en administrador</Button>
        </div>
      )}

      {isAdmin && (
        <div className="space-y-3">
          {(profiles ?? []).map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-display text-lg truncate">{p.display_name || p.email}</div>
                <div className="text-xs text-muted-foreground truncate">{p.email}</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {(["admin", "editor", "user"] as const).map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm">
                    <Switch checked={hasRole(p.id, role)} onCheckedChange={(v) => toggleRole(p.id, role, v)} disabled={p.id === currentUserId && role === "admin" && hasRole(p.id, "admin")} />
                    <span className="capitalize">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

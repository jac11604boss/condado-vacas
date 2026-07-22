"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Power, DownloadCloud, Plus } from "lucide-react";

interface AdminEvent {
  id: string;
  title: string;
  startDate: string;
  municipality: string;
  province: string;
  category: string;
  source: string;
  isActive: boolean;
  pricePerSeat: number | null;
  rrppCommissionPct: number;
  minSeats: number;
  busCapacity: number;
  tripsCount: number;
}

export default function AdminEventosPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [source, setSource] = useState("");
  const [active, setActive] = useState("");
  const [scraping, setScraping] = useState(false);

  const { data, isLoading, refetch } = useQuery<{
    total: number;
    pages: number;
    events: AdminEvent[];
  }>({
    queryKey: ["admin-events", page, search, province, source, active],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (province) params.set("province", province);
      if (source) params.set("source", source);
      if (active) params.set("active", active);
      const res = await fetch(`/api/admin/events?${params}`);
      return res.json();
    },
  });

  async function toggleActive(event: AdminEvent) {
    const res = await fetch(`/api/admin/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !event.isActive }),
    });
    if (res.ok) {
      toast.success(event.isActive ? "Evento desactivado" : "Evento activado");
      refetch();
    } else {
      toast.error("Error actualizando evento");
    }
  }

  async function runScraper() {
    setScraping(true);
    toast.info("Scraping en curso… puede tardar 2-3 minutos");
    try {
      const res = await fetch("/api/admin/scrape", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Scraping OK: ${data.created} nuevos, ${data.updated} actualizados`);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error en scraping");
    } finally {
      setScraping(false);
    }
  }

  const selectClass =
    "h-9 rounded-lg border border-white/15 bg-background px-3 text-sm";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl tracking-wide">
          GESTIÓN DE <span className="text-brand">EVENTOS</span>
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runScraper} disabled={scraping}>
            <DownloadCloud className="size-4" />
            {scraping ? "Scrapeando…" : "Scraping Agenda Cultural"}
          </Button>
          <Button onClick={() => router.push("/admin/eventos/nuevo")}>
            <Plus className="size-4" /> Nuevo evento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por título…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64"
        />
        <select value={province} onChange={(e) => { setProvince(e.target.value); setPage(1); }} className={selectClass}>
          <option value="">Provincia</option>
          {["A Coruña", "Lugo", "Ourense", "Pontevedra"].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }} className={selectClass}>
          <option value="">Fuente</option>
          <option value="SCRAPED">Agenda Cultural</option>
          <option value="CUSTOM">Propios</option>
        </select>
        <select value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }} className={selectClass}>
          <option value="">Estado</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="glass overflow-hidden rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Comisión</TableHead>
              <TableHead>Mín.</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  Sin resultados
                </TableCell>
              </TableRow>
            ) : (
              data?.events.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="max-w-56">
                    <Link
                      href={`/admin/eventos/${e.id}`}
                      className="block truncate font-medium hover:text-brand"
                      title={e.title}
                    >
                      {e.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.category} · {e.source === "SCRAPED" ? "agenda" : "propio"}
                      {e.tripsCount > 0 && ` · ${e.tripsCount} viaje(s)`}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(e.startDate), "d MMM yy", { locale: es })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.municipality}
                  </TableCell>
                  <TableCell>
                    {e.pricePerSeat ? (
                      <span className="text-brand">{e.pricePerSeat.toFixed(0)}€</span>
                    ) : (
                      <span className="text-xs text-amber-400">sin precio</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.rrppCommissionPct}%</TableCell>
                  <TableCell className="text-muted-foreground">{e.minSeats}</TableCell>
                  <TableCell>
                    <Badge className={e.isActive ? "bg-forest/20 text-forest" : "bg-white/10 text-muted-foreground"}>
                      {e.isActive ? "activo" : "inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/eventos/${e.id}`}>
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon-sm" onClick={() => toggleActive(e)}>
                        <Power className={e.isActive ? "size-4 text-destructive" : "size-4 text-forest"} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data.total} eventos · página {page} de {data.pages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

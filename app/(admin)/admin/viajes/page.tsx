"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { BusProgress } from "@/components/trips/bus-progress";

interface AdminTrip {
  tripId: string;
  status: string;
  originCity: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    province: string;
    minSeats: number;
  };
  rrpp: { code: string; name: string | null };
  soldSeats: number;
  buses: { id: string; number: number; capacity: number; status: string; soldSeats: number }[];
}

const statusBadge: Record<string, string> = {
  OPEN: "bg-forest/20 text-forest",
  CONFIRMED: "bg-brand/20 text-brand",
  CANCELLED: "bg-destructive/20 text-destructive",
  COMPLETED: "bg-white/10 text-muted-foreground",
};

export default function AdminViajesPage() {
  const [status, setStatus] = useState("");
  const [province, setProvince] = useState("");

  const { data, isLoading } = useQuery<{ trips: AdminTrip[] }>({
    queryKey: ["admin-trips", status, province],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (province) params.set("province", province);
      const res = await fetch(`/api/admin/trips?${params}`);
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const selectClass = "h-9 rounded-lg border border-white/15 bg-background px-3 text-sm";

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-wide">
        VIAJES Y <span className="text-brand">BUSES</span>
      </h1>

      <div className="flex flex-wrap gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="">Todos los estados</option>
          <option value="OPEN">En venta</option>
          <option value="CONFIRMED">Confirmados</option>
          <option value="CANCELLED">Cancelados</option>
          <option value="COMPLETED">Completados</option>
        </select>
        <select value={province} onChange={(e) => setProvince(e.target.value)} className={selectClass}>
          <option value="">Todas las provincias</option>
          {["A Coruña", "Lugo", "Ourense", "Pontevedra"].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>RRPP</TableHead>
              <TableHead>Salida</TableHead>
              <TableHead className="w-52">Progreso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell>
                </TableRow>
              ))
            ) : data?.trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Sin viajes
                </TableCell>
              </TableRow>
            ) : (
              data?.trips.map((t) => (
                <TableRow key={t.tripId}>
                  <TableCell>
                    <p className="font-medium">{t.event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(t.event.startDate), "d MMM yyyy", { locale: es })} · {t.event.province}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">@{t.rrpp.code}</p>
                  </TableCell>
                  <TableCell className="capitalize">{t.originCity}</TableCell>
                  <TableCell>
                    <BusProgress
                      sold={t.soldSeats}
                      min={t.event.minSeats}
                      capacity={t.buses.reduce((a, b) => a + b.capacity, 0) || 55}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge className={statusBadge[t.status]}>{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/viajes/${t.tripId}`}
                      className="text-sm font-semibold text-brand hover:underline"
                    >
                      Gestionar →
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

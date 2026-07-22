"use client";

import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/admin/stats-card";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CalendarDays,
  Bus,
  Ticket,
  Euro,
  TrendingUp,
} from "lucide-react";

interface DashboardData {
  kpis: {
    rrppTotal: number;
    rrppApproved: number;
    rrppPending: number;
    eventsActive: number;
    busesOpen: number;
    busesConfirmed: number;
    monthSeats: number;
    monthRevenue: number;
    commissionsPaid: number;
  };
  charts: {
    salesByProvince: { province: string; seats: number }[];
    salesByMonth: { month: string; seats: number; revenue: number }[];
    topRrpp: { code: string; name: string; seats: number; earnings: number }[];
    categoryDistribution: { category: string; seats: number }[];
  };
  upcomingEvents: {
    id: string;
    title: string;
    startDate: string;
    municipality: string;
    trips: number;
    buses: number;
    hasConfirmedBus: boolean;
  }[];
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const { kpis } = data;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl tracking-wide">
        PANEL DE <span className="text-brand">CONTROL</span>
      </h1>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Users} label="RRPP totales" value={kpis.rrppTotal} sub={`${kpis.rrppApproved} activos · ${kpis.rrppPending} pendientes`} accent="party" />
        <StatsCard icon={CalendarDays} label="Eventos activos" value={kpis.eventsActive} accent="forest" />
        <StatsCard icon={Bus} label="Buses en venta" value={kpis.busesOpen} sub={`${kpis.busesConfirmed} confirmados`} />
        <StatsCard icon={Ticket} label="Plazas este mes" value={kpis.monthSeats} accent="party" />
        <StatsCard icon={Euro} label="Ingresos este mes" value={`${kpis.monthRevenue.toFixed(0)}€`} />
        <StatsCard icon={TrendingUp} label="Comisiones pagadas RRPP" value={`${kpis.commissionsPaid.toFixed(0)}€`} accent="forest" />
      </div>

      {/* Gráficos */}
      <DashboardCharts
        salesByProvince={data.charts.salesByProvince}
        salesByMonth={data.charts.salesByMonth}
        topRrpp={data.charts.topRrpp}
        categoryDistribution={data.charts.categoryDistribution}
      />

      {/* Tablas */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top RRPP */}
        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Top RRPP</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RRPP</TableHead>
                <TableHead className="text-right">Plazas</TableHead>
                <TableHead className="text-right">Ganado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.charts.topRrpp.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Sin ventas aún
                  </TableCell>
                </TableRow>
              ) : (
                data.charts.topRrpp.map((r) => (
                  <TableRow key={r.code}>
                    <TableCell className="font-medium">@{r.code}</TableCell>
                    <TableCell className="text-right">{r.seats}</TableCell>
                    <TableCell className="text-right text-brand">{r.earnings.toFixed(2)}€</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Próximos eventos */}
        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Próximos eventos</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Buses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.upcomingEvents.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="max-w-48 truncate font-medium">{e.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(e.startDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </TableCell>
                  <TableCell className="text-right">
                    {e.buses > 0 ? (
                      <Badge className={e.hasConfirmedBus ? "bg-forest/20 text-forest" : "bg-brand/20 text-brand"}>
                        {e.buses} {e.hasConfirmedBus ? "· confirmado" : ""}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

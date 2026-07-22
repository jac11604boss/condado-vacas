"use client";

import { useMyTrips } from "@/hooks/use-events";
import { Skeleton } from "@/components/ui/skeleton";
import { Euro, TrendingUp, Ticket } from "lucide-react";

export default function GananciasPage() {
  const { data, isLoading } = useMyTrips();
  const trips = data?.trips ?? [];

  const totalEarnings = trips.reduce((acc, t) => acc + t.earnings, 0);
  const totalSeats = trips.reduce((acc, t) => acc + t.soldSeats, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">
          MIS <span className="text-brand">GANANCIAS</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comisiones acumuladas por plazas vendidas. Los pagos se hacen tras
          cada evento.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Euro, label: "Total ganado", value: `${totalEarnings.toFixed(2)}€` },
          { icon: Ticket, label: "Plazas vendidas", value: totalSeats },
          { icon: TrendingUp, label: "Viajes activos", value: trips.filter((t) => t.status === "OPEN").length },
        ].map((kpi) => (
          <div key={kpi.label} className="glass rounded-xl p-5">
            <kpi.icon className="size-5 text-brand" />
            <p className="mt-2 font-display text-3xl">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Detalle por viaje */}
      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : trips.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Aún no tienes ganancias. Habilita tu primer bus 🚌
        </p>
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-4">Evento</th>
                <th className="p-4">Salida</th>
                <th className="p-4 text-right">Plazas</th>
                <th className="p-4 text-right">Ganado</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.tripId} className="border-b border-white/5">
                  <td className="p-4 font-medium">{t.event.title}</td>
                  <td className="p-4 text-muted-foreground">{t.originCity}</td>
                  <td className="p-4 text-right">{t.soldSeats}</td>
                  <td className="p-4 text-right font-semibold text-brand">
                    {t.earnings.toFixed(2)}€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="p-4 text-xs text-muted-foreground">
            💶 Los pagos se transfieren automáticamente a tu cuenta tras la
            realización del evento (Stripe Connect).
          </p>
        </div>
      )}
    </div>
  );
}

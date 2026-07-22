"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useEvents } from "@/hooks/use-events";
import { useFiltersStore } from "@/stores/filters-store";
import { EventFilters } from "@/components/events/event-filters";
import { CalendarMonth } from "@/components/events/calendar-month";
import { CalendarList } from "@/components/events/calendar-list";
import { Skeleton } from "@/components/ui/skeleton";

// Mapbox pesa ~800KB: lazy load solo cuando se usa la vista mapa
const CalendarMap = dynamic(
  () => import("@/components/events/calendar-map").then((m) => m.CalendarMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[560px] rounded-xl" />,
  }
);

export default function CalendarioPage() {
  const { view, province, category, onlyMine } = useFiltersStore();
  const { data, isLoading, isError } = useEvents({ province, category });

  const events = useMemo(() => {
    const all = data?.events ?? [];
    return onlyMine ? all.filter((e) => e.enabledByMe) : all;
  }, [data, onlyMine]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">
          CALENDARIO DE <span className="text-brand">EVENTOS</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige un evento y habilita tu bus. Tú solo pones la salida y el
          enlace; del resto nos ocupamos nosotros.
        </p>
      </div>

      <EventFilters />

      {isLoading && (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <p className="py-16 text-center text-destructive">
          Error cargando el calendario. Recarga la página.
        </p>
      )}

      {!isLoading && !isError && (
        <>
          {view === "month" && <CalendarMonth events={events} />}
          {view === "list" && <CalendarList events={events} />}
          {view === "map" && <CalendarMap events={events} />}
        </>
      )}
    </div>
  );
}

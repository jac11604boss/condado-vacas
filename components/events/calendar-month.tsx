"use client";

import { useState } from "react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  format,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFiltersStore } from "@/stores/filters-store";
import type { CalendarEvent } from "@/hooks/use-events";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const CATEGORY_COLORS: Record<string, string> = {
  "fiesta-tradicional": "bg-brand",
  romeria: "bg-forest",
  festival: "bg-party",
  concierto: "bg-sky-400",
  deporte: "bg-emerald-400",
  feria: "bg-amber-400",
  espectaculo: "bg-fuchsia-400",
  "fiesta-privada": "bg-pink-400",
};

function eventOnDay(e: CalendarEvent, day: Date) {
  const start = new Date(e.startDate);
  const end = e.endDate ? new Date(e.endDate) : start;
  return isWithinInterval(day, {
    start: new Date(start.getFullYear(), start.getMonth(), start.getDate()),
    end: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59),
  });
}

// Vista mensual tipo Google Calendar con chips de eventos.
export function CalendarMonth({ events }: { events: CalendarEvent[] }) {
  const { month, setMonth } = useFiltersStore();
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const monthStart = startOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });

  const days: Date[] = [];
  for (let d = calendarStart; d <= calendarEnd; d = addDays(d, 1)) days.push(d);

  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div>
      {/* Navegación de mes */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl capitalize tracking-wide">
          {format(month, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setMonth(addMonths(month, -1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMonth(new Date())}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={() => setMonth(addMonths(month, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Cabecera días */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
        {weekDays.map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      {/* Grid del mes */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayEvents = events.filter((e) => eventOnDay(e, day));
          const inMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-24 rounded-lg border border-white/5 p-1.5",
                inMonth ? "bg-white/[0.03]" : "opacity-40",
                isToday && "ring-1 ring-brand"
              )}
            >
              <p className={cn("text-right text-xs", isToday && "font-bold text-brand")}>
                {format(day, "d")}
              </p>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className={cn(
                      "block w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium text-white",
                      CATEGORY_COLORS[e.category] ?? "bg-slate-500",
                      e.enabledByMe && "ring-1 ring-white"
                    )}
                    title={e.title}
                  >
                    {e.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="px-1 text-[10px] text-muted-foreground">
                    +{dayEvents.length - 3} más
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialog detalle */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <Badge className="w-fit bg-white/10">{selected.category}</Badge>
                <DialogTitle className="font-display text-2xl tracking-wide">
                  {selected.title.toUpperCase()}
                </DialogTitle>
                <DialogDescription>
                  {format(new Date(selected.startDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  {selected.endDate &&
                    ` — ${format(new Date(selected.endDate), "d 'de' MMMM", { locale: es })}`}
                  {" · "}
                  {selected.municipality} ({selected.province})
                </DialogDescription>
              </DialogHeader>
              {selected.description && (
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {selected.enabledCount} bus(es) habilitado(s)
                </span>
                {selected.pricePerSeat && (
                  <span className="font-display text-xl text-brand">
                    {selected.pricePerSeat.toFixed(0)}€/plaza
                  </span>
                )}
              </div>
              {selected.enabledByMe ? (
                <Button variant="secondary" onClick={() => setSelected(null)}>
                  ✅ Ya lo habilitaste
                </Button>
              ) : (
                <Link
                  href={`/panel/habilitar/${selected.id}`}
                  className={cn(buttonVariants(), "w-full")}
                >
                  Habilitar bus para este evento
                </Link>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

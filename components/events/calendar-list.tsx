"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin } from "lucide-react";
import type { CalendarEvent } from "@/hooks/use-events";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Vista lista: tarjetas verticales con póster, título y fecha.
export function CalendarList({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No hay eventos con estos filtros.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((e) => (
        <div key={e.id} className="glass flex gap-4 rounded-xl p-3">
          {/* Póster mini */}
          <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
            {e.imageUrl ? (
              <Image src={e.imageUrl} alt={e.title} fill sizes="64px" className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-party/30 to-forest/20" />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-white/15 text-[10px]">
                {e.category}
              </Badge>
              {e.source === "CUSTOM" && (
                <Badge className="bg-party/20 text-[10px] text-party">propio</Badge>
              )}
              {e.enabledByMe && (
                <Badge className="bg-forest/20 text-[10px] text-forest">habilitado</Badge>
              )}
            </div>
            <h3 className="mt-1 truncate font-display text-lg tracking-wide">
              {e.title.toUpperCase()}
            </h3>
            <p className="text-xs text-muted-foreground">
              {format(new Date(e.startDate), "d MMM yyyy", { locale: es })}
              {" · "}
              <MapPin className="inline size-3" /> {e.municipality}, {e.province}
            </p>
          </div>

          {/* Acción */}
          <div className="flex shrink-0 flex-col items-end justify-center gap-1">
            {e.pricePerSeat && (
              <span className="font-display text-lg text-brand">
                {e.pricePerSeat.toFixed(0)}€
              </span>
            )}
            {e.enabledByMe ? (
              <span className="text-xs text-forest">✅ Tuyo</span>
            ) : (
              <Link
                href={`/panel/habilitar/${e.id}`}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Habilitar
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

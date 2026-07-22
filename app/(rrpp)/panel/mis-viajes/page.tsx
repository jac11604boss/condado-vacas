"use client";

import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMyTrips } from "@/hooks/use-events";
import { ShareLinkCard } from "@/components/trips/share-link-card";
import { BusProgress } from "@/components/trips/bus-progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bus } from "lucide-react";

const statusLabels: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Vendiendo", className: "bg-forest/20 text-forest" },
  CONFIRMED: { label: "Confirmado", className: "bg-brand/20 text-brand" },
  CANCELLED: { label: "Cancelado", className: "bg-destructive/20 text-destructive" },
  COMPLETED: { label: "Completado", className: "bg-white/10 text-muted-foreground" },
};

export default function MisViajesPage() {
  const { data, isLoading } = useMyTrips();
  const trips = data?.trips ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">
          MIS <span className="text-brand">VIAJES</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tus enlaces y las plazas vendidas en tiempo real (se actualiza cada
          15s).
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && trips.length === 0 && (
        <div className="glass rounded-2xl p-16 text-center">
          <Bus className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 font-display text-2xl tracking-wide">
            AÚN NO HAS HABILITADO NINGÚN BUS
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ve al calendario, elige un evento que te mole y habilita tu primer
            bus.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {trips.map((trip) => {
          const st = statusLabels[trip.status] ?? statusLabels.OPEN;
          return (
            <div key={trip.tripId} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                  {trip.event.imageUrl ? (
                    <Image
                      src={trip.event.imageUrl}
                      alt={trip.event.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-party/30 to-forest/20" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl tracking-wide">
                      {trip.event.title.toUpperCase()}
                    </h2>
                    <Badge className={st.className}>{st.label}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {format(new Date(trip.event.startDate), "d MMM yyyy", { locale: es })}
                    {" · "}Bus desde {trip.originCity}
                    {" · "}
                    {trip.event.pricePerSeat
                      ? `${trip.event.pricePerSeat.toFixed(0)}€/plaza`
                      : "precio por confirmar"}
                  </p>

                  <div className="mt-3 max-w-md space-y-2">
                    {trip.buses.map((bus) => (
                      <div key={bus.id}>
                        <p className="mb-1 text-xs text-muted-foreground">
                          Bus #{bus.number}
                          {bus.status === "FULL" && " — COMPLETO 🎉"}
                          {bus.status === "CONFIRMED" && " — CONFIRMADO ✅"}
                        </p>
                        <BusProgress
                          sold={bus.soldSeats}
                          min={trip.event.minSeats}
                          capacity={bus.capacity}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Ganado</p>
                  <p className="font-display text-3xl text-brand">
                    {trip.earnings.toFixed(2)}€
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <ShareLinkCard url={trip.shareUrl} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

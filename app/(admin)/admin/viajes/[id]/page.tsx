"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmBusModal } from "@/components/admin/confirm-bus-modal";
import { RefundModal } from "@/components/admin/refund-modal";
import { BusProgress } from "@/components/trips/bus-progress";
import { ArrowLeft, Bus, CheckCircle2 } from "lucide-react";

interface TripDetail {
  tripId: string;
  status: string;
  originCity: string;
  event: {
    title: string;
    startDate: string;
    minSeats: number;
    pricePerSeat: number | null;
  };
  rrpp: { code: string; name: string | null; email: string };
  soldSeats: number;
  buses: { id: string; number: number; capacity: number; status: string; soldSeats: number }[];
}

export default function AdminViajeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [confirmBusId, setConfirmBusId] = useState<string | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery<{ trips: TripDetail[] }>({
    queryKey: ["admin-trip", params.id],
    queryFn: async () => {
      const res = await fetch("/api/admin/trips");
      return res.json();
    },
    refetchInterval: 15_000,
  });

  const trip = data?.trips.find((t) => t.tripId === params.id);

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;
  if (!trip) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Viaje no encontrado
      </p>
    );
  }

  const confirmBus = trip.buses.find((b) => b.id === confirmBusId);
  const totalAmount =
    trip.soldSeats * (trip.event.pricePerSeat ?? 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/admin/viajes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver a viajes
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide">
            {trip.event.title.toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(new Date(trip.event.startDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
            {" · "}Bus desde <span className="capitalize">{trip.originCity}</span>
            {" · "}por @{trip.rrpp.code} ({trip.rrpp.email})
          </p>
        </div>
        <Badge className={trip.status === "CONFIRMED" ? "bg-brand/20 text-brand" : "bg-forest/20 text-forest"}>
          {trip.status}
        </Badge>
      </div>

      {/* Buses */}
      <div className="space-y-4">
        {trip.buses.map((bus) => {
          const canConfirm = bus.status === "OPEN" && bus.soldSeats >= trip.event.minSeats;
          return (
            <div key={bus.id} className="glass rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Bus className="size-6 text-party" />
                  <div>
                    <p className="font-display text-xl tracking-wide">
                      BUS #{bus.number}
                    </p>
                    <Badge
                      className={
                        bus.status === "CONFIRMED"
                          ? "bg-brand/20 text-brand"
                          : bus.status === "FULL"
                            ? "bg-party/20 text-party"
                            : "bg-forest/20 text-forest"
                      }
                    >
                      {bus.status}
                    </Badge>
                  </div>
                </div>

                <div className="w-64">
                  <BusProgress sold={bus.soldSeats} min={trip.event.minSeats} capacity={bus.capacity} />
                </div>

                <div className="flex gap-2">
                  {bus.status === "CONFIRMED" ? (
                    <span className="flex items-center gap-1.5 text-sm text-forest">
                      <CheckCircle2 className="size-4" /> Confirmado
                    </span>
                  ) : (
                    <Button
                      onClick={() => setConfirmBusId(bus.id)}
                      disabled={!canConfirm}
                      title={canConfirm ? "" : `Faltan plazas (${bus.soldSeats}/${trip.event.minSeats})`}
                    >
                      Confirmar bus
                    </Button>
                  )}
                </div>
              </div>
              {!canConfirm && bus.status === "OPEN" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Faltan {trip.event.minSeats - bus.soldSeats} plazas para poder confirmar.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Zona peligrosa */}
      {trip.status !== "CANCELLED" && trip.soldSeats > 0 && (
        <div className="glass rounded-xl border border-destructive/30 p-5">
          <h2 className="font-display text-lg tracking-wide text-destructive">
            ZONA DE RIESGO
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Si el bus no se puede realizar, reembolsa a todos los pasajeros.
          </p>
          <Button variant="destructive" className="mt-4" onClick={() => setRefundOpen(true)}>
            Reembolso masivo ({trip.soldSeats} plazas · {totalAmount.toFixed(2)}€)
          </Button>
        </div>
      )}

      {/* Modales */}
      {confirmBus && (
        <ConfirmBusModal
          tripId={trip.tripId}
          busId={confirmBus.id}
          busNumber={confirmBus.number}
          open={!!confirmBusId}
          onClose={() => {
            setConfirmBusId(null);
            refetch();
          }}
        />
      )}
      <RefundModal
        tripId={trip.tripId}
        eventTitle={trip.event.title}
        passengers={trip.soldSeats}
        totalAmount={totalAmount}
        open={refundOpen}
        onClose={() => {
          setRefundOpen(false);
          refetch();
        }}
      />
    </div>
  );
}

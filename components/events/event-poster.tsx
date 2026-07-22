import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Bus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TripCard } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

// Tarjeta estilo "póster de película": imagen grande, gradiente oscuro,
// título Bebas abajo con fecha, ubicación y badge del bus.
export function EventPoster({ trip }: { trip: TripCard }) {
  const href = `/evento/${trip.event.slug}?rrpp=${trip.rrppCode}&salida=${trip.originCity}`;

  return (
    <Link
      href={href}
      className="group relative block aspect-[2/3] overflow-hidden rounded-2xl border border-white/10"
    >
      {trip.event.imageUrl ? (
        <Image
          src={trip.event.imageUrl}
          alt={trip.event.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-party/40 via-slate-800 to-forest/30" />
      )}

      {/* Gradiente overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />

      {/* Categoría */}
      <Badge className="absolute left-3 top-3 bg-black/50 text-white backdrop-blur-sm">
        {trip.event.category}
      </Badge>

      {/* Contenido inferior */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-display text-2xl leading-tight tracking-wide text-white">
          {trip.event.title.toUpperCase()}
        </h3>

        <div className="mt-2 space-y-1 text-xs text-white/80">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-brand" />
            {formatDate(trip.event.startDate)}
            {trip.event.endDate && ` — ${formatDate(trip.event.endDate)}`}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-forest" />
            {trip.event.municipality}, {trip.event.province}
          </p>
          <p className="flex items-center gap-1.5">
            <Bus className="size-3.5 text-party" />
            Sale de {trip.originCity}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {trip.event.pricePerSeat ? (
            <span className="font-display text-2xl text-brand">
              {trip.event.pricePerSeat.toFixed(0)}€
            </span>
          ) : (
            <span className="text-xs text-white/60">Precio por confirmar</span>
          )}
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] text-white/70 backdrop-blur-sm">
            {trip.soldSeats}/{trip.event.minSeats} para confirmar
          </span>
        </div>
      </div>
    </Link>
  );
}

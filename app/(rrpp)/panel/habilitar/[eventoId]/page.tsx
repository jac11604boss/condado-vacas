import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { EnableTripForm } from "@/components/trips/enable-trip-form";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Habilitar bus" };

export default async function HabilitarPage({
  params,
}: {
  params: { eventoId: string };
}) {
  const event = await prisma.event.findUnique({
    where: { id: params.eventoId },
  });
  if (!event || !event.isActive) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/panel/calendario"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Volver al calendario
      </Link>

      <div className="glass overflow-hidden rounded-2xl">
        {/* Cabecera evento */}
        <div className="relative h-44">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              sizes="768px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-party/40 to-forest/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-4 left-6">
            <Badge className="mb-2 bg-black/50">{event.category}</Badge>
            <h1 className="font-display text-3xl tracking-wide">
              {event.title.toUpperCase()}
            </h1>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4 text-forest" />
              {event.municipality}, {event.province}
            </p>
            <p>
              📅{" "}
              {format(event.startDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
              {event.endDate &&
                ` — ${format(event.endDate, "d 'de' MMMM", { locale: es })}`}
            </p>
            <p>
              💶{" "}
              {event.pricePerSeat
                ? `${Number(event.pricePerSeat).toFixed(0)}€/plaza`
                : "Precio por confirmar por el equipo"}
              {" · "}🎯 Mínimo {event.minSeats} plazas
            </p>
            <p className="text-muted-foreground">
              Tu comisión: {Number(event.rrppCommissionPct).toFixed(0)}% por
              plaza vendida
            </p>
          </div>

          <div className="glass rounded-xl p-5">
            <h2 className="mb-4 font-display text-xl tracking-wide">
              HABILITA TU <span className="text-brand">BUS</span>
            </h2>
            <EnableTripForm eventId={event.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

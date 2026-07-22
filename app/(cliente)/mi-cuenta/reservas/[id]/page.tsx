import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import QRCode from "qrcode";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Clock, User, Phone, Bus } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi reserva" };

export default async function ReservaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/mi-cuenta/reservas/${params.id}`);

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { bus: { include: { trip: { include: { event: true } } } } },
  });

  if (!booking || (booking.userId !== user.id && user.role !== "ADMIN")) {
    notFound();
  }

  const event = booking.bus.trip.event;
  const bus = booking.bus;
  const isPaid = booking.status === "PAID" || booking.status === "CHECKED_IN";
  const busConfirmed = bus.status === "CONFIRMED";

  // QR como data URL (solo si está pagada)
  const qrDataUrl = isPaid
    ? await QRCode.toDataURL(booking.qrToken, {
        width: 320,
        margin: 2,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      })
    : null;

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-12">
      <Link
        href="/mi-cuenta/reservas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Mis reservas
      </Link>

      <div className="glass mt-4 overflow-hidden rounded-2xl">
        {/* Cabecera evento */}
        <div className="relative h-40">
          {event.imageUrl ? (
            <Image src={event.imageUrl} alt={event.title} fill sizes="512px" className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-party/40 to-forest/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-3 left-5">
            <h1 className="font-display text-2xl tracking-wide">
              {event.title.toUpperCase()}
            </h1>
            <p className="text-sm text-white/80">
              {format(event.startDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
              {" · "}{event.municipality}
            </p>
          </div>
        </div>

        <div className="p-5">
          {/* Estado */}
          <div className="flex items-center justify-between">
            <Badge
              className={
                booking.status === "REFUNDED"
                  ? "bg-white/10 text-muted-foreground"
                  : busConfirmed
                    ? "bg-forest/20 text-forest"
                    : isPaid
                      ? "bg-brand/20 text-brand"
                      : "bg-amber-500/20 text-amber-400"
              }
            >
              {booking.status === "REFUNDED"
                ? "Reembolsada"
                : busConfirmed
                  ? "Bus confirmado ✅"
                  : isPaid
                    ? "Pagada · pendiente de confirmar bus"
                    : "Pago pendiente"}
            </Badge>
            <span className="font-display text-2xl text-brand">
              {Number(booking.totalPrice).toFixed(2)}€
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-white/5 p-2">
              <p className="text-xs text-muted-foreground">Plazas</p>
              <p className="font-semibold">{booking.seats}</p>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <p className="text-xs text-muted-foreground">Bus</p>
              <p className="font-semibold">#{bus.number}</p>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <p className="text-xs text-muted-foreground">Salida</p>
              <p className="font-semibold capitalize">{booking.bus.trip.originCity}</p>
            </div>
          </div>

          {/* QR */}
          {qrDataUrl && (
            <>
              <Separator className="my-5" />
              <div className="text-center">
                <p className="text-sm font-semibold">Tu QR de embarque</p>
                <p className="text-xs text-muted-foreground">
                  Muéstralo al subir al bus
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="QR de embarque"
                  className="mx-auto mt-4 rounded-xl border-4 border-white"
                  width={240}
                  height={240}
                />
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                  {booking.qrToken.slice(-16)}
                </p>
              </div>
            </>
          )}

          {/* Info del bus confirmado */}
          {busConfirmed && (
            <>
              <Separator className="my-5" />
              <div className="space-y-3">
                <h2 className="font-display text-lg tracking-wide text-forest">
                  TU BUS ESTÁ CONFIRMADO 🚌
                </h2>
                {bus.meetingPoint && (
                  <p className="flex items-start gap-3 text-sm">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
                    <span><strong>Punto de encuentro:</strong> {bus.meetingPoint}</span>
                  </p>
                )}
                {bus.departureTime && (
                  <p className="flex items-start gap-3 text-sm">
                    <Clock className="mt-0.5 size-4 shrink-0 text-brand" />
                    <span>
                      <strong>Salida:</strong>{" "}
                      {format(bus.departureTime, "EEEE d 'de' MMMM, HH:mm", { locale: es })}h
                      {" "}(llega 15 min antes)
                    </span>
                  </p>
                )}
                {bus.driverName && (
                  <p className="flex items-start gap-3 text-sm">
                    <User className="mt-0.5 size-4 shrink-0 text-brand" />
                    <span><strong>Conductor:</strong> {bus.driverName}</span>
                  </p>
                )}
                {bus.driverPhone && (
                  <p className="flex items-start gap-3 text-sm">
                    <Phone className="mt-0.5 size-4 shrink-0 text-brand" />
                    <span><strong>Teléfono:</strong> {bus.driverPhone}</span>
                  </p>
                )}
              </div>
            </>
          )}

          {/* Pendiente de confirmar */}
          {isPaid && !busConfirmed && (
            <>
              <Separator className="my-5" />
              <div className="rounded-lg bg-brand/10 p-4 text-sm">
                <p className="flex items-start gap-2">
                  <Bus className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span>
                    El bus aún no está confirmado. Te enviaremos un email con el
                    punto de encuentro y la hora en cuanto se confirme. Si no se
                    confirma, <strong>te devolvemos el 100%</strong>.
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

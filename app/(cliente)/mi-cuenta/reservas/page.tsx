import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mis reservas" };

function bookingStatus(booking: {
  status: string;
  bus: { status: string };
}): { label: string; className: string } {
  if (booking.status === "REFUNDED")
    return { label: "Reembolsada", className: "bg-white/10 text-muted-foreground" };
  if (booking.status === "CANCELLED")
    return { label: "Cancelada", className: "bg-destructive/20 text-destructive" };
  if (booking.status === "CHECKED_IN")
    return { label: "Embarcado ✅", className: "bg-forest/20 text-forest" };
  if (booking.status === "PAID" && booking.bus.status === "CONFIRMED")
    return { label: "Bus confirmado", className: "bg-forest/20 text-forest" };
  if (booking.status === "PAID")
    return { label: "Pagada · pendiente de confirmar", className: "bg-brand/20 text-brand" };
  return { label: "Pago pendiente", className: "bg-amber-500/20 text-amber-400" };
}

export default async function ReservasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/mi-cuenta/reservas");

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { bus: { include: { trip: { include: { event: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide">
        MIS <span className="text-brand">RESERVAS</span>
      </h1>

      {bookings.length === 0 ? (
        <div className="glass mt-10 rounded-2xl p-16 text-center">
          <Ticket className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 font-display text-2xl tracking-wide">
            AÚN NO TIENES RESERVAS
          </p>
          <Link
            href="/eventos"
            className="mt-4 inline-block font-semibold text-brand hover:underline"
          >
            Ver eventos con bus →
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {bookings.map((booking) => {
            const st = bookingStatus(booking);
            const event = booking.bus.trip.event;
            return (
              <Link
                key={booking.id}
                href={`/mi-cuenta/reservas/${booking.id}`}
                className="glass flex gap-4 rounded-xl p-4 transition-colors hover:bg-white/10"
              >
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                  {event.imageUrl ? (
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
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
                    <h2 className="font-display text-lg tracking-wide">
                      {event.title.toUpperCase()}
                    </h2>
                    <Badge className={st.className}>{st.label}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(event.startDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
                    {" · "}Bus desde {booking.bus.trip.originCity}
                    {" · "}{booking.seats} plaza(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl text-brand">
                    {Number(booking.totalPrice).toFixed(2)}€
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

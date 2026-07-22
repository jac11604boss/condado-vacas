import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcRrppEarnings } from "@/lib/commissions";
import { buttonVariants } from "@/components/ui/button";
import { BusProgress } from "@/components/trips/bus-progress";
import { Euro, Ticket, Bus, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel RRPP" };

export default async function PanelPage() {
  const user = await getCurrentUser();
  const profile = user?.rrppProfile;

  const trips = profile
    ? await prisma.trip.findMany({
        where: { rrppId: profile.id },
        include: {
          event: true,
          buses: {
            include: {
              bookings: {
                where: { status: { in: ["PAID", "CHECKED_IN"] } },
                select: { seats: true },
              },
            },
          },
        },
        orderBy: { event: { startDate: "asc" } },
      })
    : [];

  const stats = trips.reduce(
    (acc, trip) => {
      const sold = trip.buses.reduce(
        (a, b) => a + b.bookings.reduce((x, bk) => x + bk.seats, 0),
        0
      );
      const price = trip.event.pricePerSeat ? Number(trip.event.pricePerSeat) : 0;
      return {
        seats: acc.seats + sold,
        earnings:
          acc.earnings +
          calcRrppEarnings(sold, price, Number(trip.event.rrppCommissionPct)),
        active: acc.active + (trip.status === "OPEN" ? 1 : 0),
      };
    },
    { seats: 0, earnings: 0, active: 0 }
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide">
          ¡HOLA, {user?.name?.split(" ")[0]?.toUpperCase() ?? "RRPP"}! 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu código: <span className="font-mono text-party">{profile?.code}</span>
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Euro, label: "Ganado acumulado", value: `${stats.earnings.toFixed(2)}€` },
          { icon: Ticket, label: "Plazas vendidas", value: stats.seats },
          { icon: Bus, label: "Viajes activos", value: stats.active },
        ].map((kpi) => (
          <div key={kpi.label} className="glass rounded-xl p-5">
            <kpi.icon className="size-5 text-brand" />
            <p className="mt-2 font-display text-3xl">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Viajes activos */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-wide">TUS VIAJES</h2>
          <Link href="/panel/calendario" className={cn(buttonVariants({ size: "sm" }))}>
            <CalendarDays className="size-4" /> Habilitar otro
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Bus className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-4 font-display text-2xl tracking-wide">
              EMPIEZA AHORA
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Ve al calendario, elige un evento que le mole a tu gente y
              habilita tu primer bus. Compartes el enlace y a ganar.
            </p>
            <Link href="/panel/calendario" className={cn(buttonVariants(), "mt-6")}>
              Ver calendario de eventos
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trips.slice(0, 4).map((trip) => {
              const sold = trip.buses.reduce(
                (a, b) => a + b.bookings.reduce((x, bk) => x + bk.seats, 0),
                0
              );
              const capacity = trip.buses[0]?.capacity ?? trip.event.busCapacity;
              return (
                <Link
                  key={trip.id}
                  href="/panel/mis-viajes"
                  className="glass rounded-xl p-5 transition-colors hover:bg-white/10"
                >
                  <h3 className="font-display text-lg tracking-wide">
                    {trip.event.title.toUpperCase()}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    desde {trip.originCity}
                  </p>
                  <BusProgress
                    sold={sold}
                    min={trip.event.minSeats}
                    capacity={capacity}
                    className="mt-3"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

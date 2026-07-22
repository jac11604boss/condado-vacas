import { prisma } from "@/lib/prisma";
import type { TripCard, EventDetail } from "@/types";

/** Plazas vendidas (bookings PAID/CHECKED_IN) de un viaje */
async function getSoldSeatsByTrip(tripId: string): Promise<number> {
  const result = await prisma.booking.aggregate({
    where: { bus: { tripId }, status: { in: ["PAID", "CHECKED_IN"] } },
    _sum: { seats: true },
  });
  return result._sum.seats ?? 0;
}

/** Viajes habilitados (OPEN) con evento futuro — para landing y /eventos */
export async function getEnabledTrips(limit?: number): Promise<TripCard[]> {
  const trips = await prisma.trip.findMany({
    where: {
      status: "OPEN",
      event: { isActive: true, startDate: { gte: new Date() } },
    },
    include: {
      event: true,
      rrpp: { select: { code: true } },
      buses: { where: { status: "OPEN" }, orderBy: { number: "desc" }, take: 1 },
    },
    orderBy: { event: { startDate: "asc" } },
    take: limit,
  });

  return Promise.all(
    trips.map(async (t) => ({
      tripId: t.id,
      rrppCode: t.rrpp.code,
      originCity: t.originCity,
      event: {
        slug: t.event.slug,
        title: t.event.title,
        category: t.event.category,
        startDate: t.event.startDate.toISOString(),
        endDate: t.event.endDate?.toISOString() ?? null,
        municipality: t.event.municipality,
        province: t.event.province,
        imageUrl: t.event.imageUrl,
        pricePerSeat: t.event.pricePerSeat ? Number(t.event.pricePerSeat) : null,
        minSeats: t.event.minSeats,
      },
      soldSeats: await getSoldSeatsByTrip(t.id),
      capacity: t.buses[0]?.capacity ?? t.event.busCapacity,
    }))
  );
}

/** Detalle de evento por slug, con todos sus viajes habilitados */
export async function getEventDetail(slug: string): Promise<EventDetail | null> {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      trips: {
        where: { status: "OPEN" },
        include: {
          rrpp: { select: { code: true, user: { select: { name: true } } } },
          buses: { where: { status: "OPEN" }, orderBy: { number: "desc" }, take: 1 },
        },
      },
    },
  });
  if (!event) return null;

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    imageUrl: event.imageUrl,
    category: event.category,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString() ?? null,
    location: event.location,
    municipality: event.municipality,
    province: event.province,
    pricePerSeat: event.pricePerSeat ? Number(event.pricePerSeat) : null,
    minSeats: event.minSeats,
    busCapacity: event.busCapacity,
    trips: await Promise.all(
      event.trips.map(async (t) => ({
        tripId: t.id,
        rrppCode: t.rrpp.code,
        rrppName: t.rrpp.user.name,
        originCity: t.originCity,
        soldSeats: await getSoldSeatsByTrip(t.id),
        capacity: t.buses[0]?.capacity ?? event.busCapacity,
        busStatus: t.buses[0]?.status ?? "OPEN",
      }))
    ),
  };
}

/** Resuelve el enlace ?rrpp=CODE&salida=CIUDAD → tripId */
export async function getTripIdByLink(
  eventId: string,
  rrppCode: string,
  originCity: string
): Promise<string | null> {
  const trip = await prisma.trip.findFirst({
    where: {
      eventId,
      status: "OPEN",
      originCity: originCity.toLowerCase(),
      rrpp: { code: rrppCode.toLowerCase() },
    },
    select: { id: true },
  });
  return trip?.id ?? null;
}

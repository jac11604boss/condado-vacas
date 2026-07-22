import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcRrppEarnings } from "@/lib/commissions";
import { enableTripSchema, normalizeCity } from "@/lib/validators/trip";

// GET /api/trips?mine=true — mis habilitaciones con plazas vendidas y € ganado
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "RRPP" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  if (!searchParams.get("mine") || !user.rrppProfile) {
    return NextResponse.json({ error: "Parámetro mine requerido" }, { status: 400 });
  }

  const trips = await prisma.trip.findMany({
    where: { rrppId: user.rrppProfile.id },
    include: {
      event: true,
      buses: {
        include: {
          bookings: {
            where: { status: { in: ["PAID", "CHECKED_IN"] } },
            select: { seats: true },
          },
        },
        orderBy: { number: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const data = trips.map((trip) => {
    const soldSeats = trip.buses.reduce(
      (acc, bus) => acc + bus.bookings.reduce((a, b) => a + b.seats, 0),
      0
    );
    const price = trip.event.pricePerSeat ? Number(trip.event.pricePerSeat) : 0;
    const pct = Number(trip.event.rrppCommissionPct);

    return {
      tripId: trip.id,
      status: trip.status,
      originCity: trip.originCity,
      shareUrl: `${appUrl}/evento/${trip.event.slug}?rrpp=${user.rrppProfile!.code}&salida=${trip.originCity}`,
      event: {
        slug: trip.event.slug,
        title: trip.event.title,
        imageUrl: trip.event.imageUrl,
        startDate: trip.event.startDate.toISOString(),
        municipality: trip.event.municipality,
        pricePerSeat: price || null,
        minSeats: trip.event.minSeats,
      },
      soldSeats,
      earnings: calcRrppEarnings(soldSeats, price, pct),
      buses: trip.buses.map((b) => ({
        id: b.id,
        number: b.number,
        capacity: b.capacity,
        status: b.status,
        soldSeats: b.bookings.reduce((a, bk) => a + bk.seats, 0),
      })),
    };
  });

  return NextResponse.json({ trips: data });
}

// POST /api/trips — habilitar evento: { eventId, originCity } → Trip + Bus #1
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (
    !user ||
    user.role !== "RRPP" ||
    user.rrppProfile?.status !== "APPROVED"
  ) {
    return NextResponse.json(
      { error: "Solo RRPP aprobados pueden habilitar buses" },
      { status: 403 }
    );
  }

  const parsed = enableTripSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const eventId = parsed.data.eventId;
  const originCity = normalizeCity(parsed.data.originCity);

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || !event.isActive) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  const existing = await prisma.trip.findUnique({
    where: {
      eventId_rrppId_originCity: {
        eventId,
        rrppId: user.rrppProfile.id,
        originCity,
      },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: `Ya tienes un bus habilitado desde ${originCity} para este evento` },
      { status: 409 }
    );
  }

  const trip = await prisma.trip.create({
    data: {
      eventId,
      rrppId: user.rrppProfile.id,
      originCity,
      buses: { create: { number: 1, capacity: event.busCapacity } },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return NextResponse.json({
    ok: true,
    tripId: trip.id,
    shareUrl: `${appUrl}/evento/${event.slug}?rrpp=${user.rrppProfile.code}&salida=${originCity}`,
  });
}

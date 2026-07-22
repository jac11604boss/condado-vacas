import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/trips — todos los viajes con filtros
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const province = searchParams.get("province");
  const rrppCode = searchParams.get("rrpp");
  const eventId = searchParams.get("eventId");

  const trips = await prisma.trip.findMany({
    where: {
      ...(status && { status: status as "OPEN" | "CONFIRMED" | "CANCELLED" | "COMPLETED" }),
      ...(eventId && { eventId }),
      ...(province && { event: { province } }),
      ...(rrppCode && { rrpp: { code: rrppCode } }),
    },
    include: {
      event: true,
      rrpp: { include: { user: { select: { name: true, email: true } } } },
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
    orderBy: { event: { startDate: "asc" } },
  });

  return NextResponse.json({
    trips: trips.map((t) => {
      const soldSeats = t.buses.reduce(
        (a, b) => a + b.bookings.reduce((x, bk) => x + bk.seats, 0),
        0
      );
      return {
        tripId: t.id,
        status: t.status,
        originCity: t.originCity,
        createdAt: t.createdAt.toISOString(),
        event: {
          id: t.event.id,
          slug: t.event.slug,
          title: t.event.title,
          startDate: t.event.startDate.toISOString(),
          province: t.event.province,
          minSeats: t.event.minSeats,
          pricePerSeat: t.event.pricePerSeat ? Number(t.event.pricePerSeat) : null,
        },
        rrpp: {
          code: t.rrpp.code,
          name: t.rrpp.user.name,
          email: t.rrpp.user.email,
        },
        soldSeats,
        buses: t.buses.map((b) => ({
          id: b.id,
          number: b.number,
          capacity: b.capacity,
          status: b.status,
          soldSeats: b.bookings.reduce((a, bk) => a + bk.seats, 0),
        })),
      };
    }),
  });
}

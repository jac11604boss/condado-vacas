import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/bookings/[id] — detalle de reserva propia (con qrToken)
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      bus: { include: { trip: { include: { event: true } } } },
    },
  });

  if (!booking || (booking.userId !== user.id && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    booking: {
      id: booking.id,
      seats: booking.seats,
      totalPrice: Number(booking.totalPrice),
      status: booking.status,
      qrToken: booking.qrToken,
      createdAt: booking.createdAt.toISOString(),
      bus: {
        number: booking.bus.number,
        status: booking.bus.status,
        meetingPoint: booking.bus.meetingPoint,
        departureTime: booking.bus.departureTime?.toISOString() ?? null,
        driverName: booking.bus.driverName,
        driverPhone: booking.bus.driverPhone,
      },
      event: {
        slug: booking.bus.trip.event.slug,
        title: booking.bus.trip.event.title,
        imageUrl: booking.bus.trip.event.imageUrl,
        startDate: booking.bus.trip.event.startDate.toISOString(),
        municipality: booking.bus.trip.event.municipality,
      },
      originCity: booking.bus.trip.originCity,
    },
  });
}

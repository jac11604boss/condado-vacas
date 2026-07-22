import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyQrToken } from "@/lib/qr";
import { checkinSchema } from "@/lib/validators/admin";

// POST /api/checkin — validar QR de embarque (conductor/admin)
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const parsed = checkinSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "QR inválido" }, { status: 400 });
  }

  const bookingId = verifyQrToken(parsed.data.qrToken);
  if (!bookingId) {
    return NextResponse.json({ error: "QR no válido o manipulado" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { name: true } },
      bus: { include: { trip: { include: { event: { select: { title: true } } } } } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }
  if (booking.status === "CHECKED_IN") {
    return NextResponse.json(
      { error: "Este pasajero YA embarcó", alreadyCheckedIn: true },
      { status: 409 }
    );
  }
  if (booking.status !== "PAID") {
    return NextResponse.json(
      { error: `Reserva no pagada (estado: ${booking.status})` },
      { status: 409 }
    );
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CHECKED_IN", checkedInAt: new Date() },
  });

  return NextResponse.json({
    ok: true,
    passenger: booking.user.name ?? "—",
    seats: booking.seats,
    event: booking.bus.trip.event.title,
    busNumber: booking.bus.number,
  });
}

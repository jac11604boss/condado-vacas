import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { confirmBusSchema } from "@/lib/validators/admin";
import { sendEmail } from "@/lib/resend";
import {
  busConfirmedHtml,
  driverPassengerListHtml,
} from "@/lib/email-templates";

// POST /api/admin/trips/[id]/confirm — confirmar bus:
// Bus → CONFIRMED, Trip → CONFIRMED, emails a pasajeros + lista al conductor.
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const parsed = confirmBusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }
  const v = parsed.data;

  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: { event: true },
  });
  if (!trip) {
    return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });
  }

  const bus = await prisma.bus.findUnique({
    where: { id: v.busId },
    include: {
      bookings: {
        where: { status: "PAID" },
        include: { user: { select: { name: true, email: true, phone: true } } },
      },
    },
  });
  if (!bus || bus.tripId !== trip.id) {
    return NextResponse.json({ error: "Bus no encontrado" }, { status: 404 });
  }

  const soldSeats = bus.bookings.reduce((a, b) => a + b.seats, 0);
  if (soldSeats < trip.event.minSeats) {
    return NextResponse.json(
      { error: `Faltan plazas: ${soldSeats}/${trip.event.minSeats} (mínimo no alcanzado)` },
      { status: 409 }
    );
  }

  // Confirmar bus + viaje
  await prisma.$transaction([
    prisma.bus.update({
      where: { id: bus.id },
      data: {
        status: "CONFIRMED",
        busCompany: v.busCompany,
        busPlate: v.busPlate || null,
        driverName: v.driverName,
        driverPhone: v.driverPhone,
        driverEmail: v.driverEmail || null,
        meetingPoint: v.meetingPoint,
        departureTime: new Date(v.departureTime),
        returnTime: v.returnTime ? new Date(v.returnTime) : null,
        routeNotes: v.routeNotes || null,
        confirmedAt: new Date(),
      },
    }),
    prisma.trip.update({
      where: { id: trip.id },
      data: { status: "CONFIRMED" },
    }),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const departureStr = new Date(v.departureTime).toLocaleString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Emails a pasajeros (best-effort, secuencial)
  let emailsSent = 0;
  for (const booking of bus.bookings) {
    try {
      await sendEmail({
        to: booking.user.email,
        subject: `🚌 ¡Tu bus está confirmado! — ${trip.event.title}`,
        html: busConfirmedHtml({
          name: booking.user.name ?? "viajero/a",
          eventTitle: trip.event.title,
          meetingPoint: v.meetingPoint,
          departureTime: departureStr,
          driverName: v.driverName,
          driverPhone: v.driverPhone,
          bookingUrl: `${appUrl}/mi-cuenta/reservas/${booking.id}`,
        }),
      });
      emailsSent++;
    } catch (e) {
      console.error(`Error email pasajero ${booking.user.email}:`, e);
    }
  }

  // Email al conductor con la lista de pasajeros
  let driverEmailSent = false;
  if (v.driverEmail) {
    try {
      await sendEmail({
        to: v.driverEmail,
        subject: `📋 Lista de pasajeros — ${trip.event.title} (${departureStr})`,
        html: driverPassengerListHtml({
          driverName: v.driverName,
          eventTitle: trip.event.title,
          meetingPoint: v.meetingPoint,
          departureTime: departureStr,
          passengers: bus.bookings.map((b) => ({
            name: b.user.name ?? "—",
            seats: b.seats,
            qrToken: b.qrToken,
          })),
          totalSeats: soldSeats,
        }),
      });
      driverEmailSent = true;
    } catch (e) {
      console.error("Error email conductor:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    passengers: bus.bookings.length,
    emailsSent,
    driverEmailSent,
  });
}

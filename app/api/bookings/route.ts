import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { generateQrToken } from "@/lib/qr";
import { createBookingSchema } from "@/lib/validators/booking";

// POST /api/bookings — crea Booking PENDING + Stripe Checkout Session
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = createBookingSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { tripId, seats } = parsed.data;

  // Trip + evento + bus abierto actual
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      event: true,
      rrpp: { select: { code: true } },
      buses: {
        where: { status: "OPEN" },
        orderBy: { number: "desc" },
        take: 1,
        include: {
          bookings: {
            where: { status: { in: ["PAID", "CHECKED_IN"] } },
            select: { seats: true },
          },
        },
      },
    },
  });

  if (!trip || trip.status !== "OPEN") {
    return NextResponse.json(
      { error: "Este viaje no está disponible" },
      { status: 404 }
    );
  }

  const bus = trip.buses[0];
  if (!bus) {
    return NextResponse.json(
      { error: "No hay buses abiertos para este viaje" },
      { status: 409 }
    );
  }

  if (!trip.event.pricePerSeat) {
    return NextResponse.json(
      { error: "El precio aún no está disponible" },
      { status: 409 }
    );
  }

  const soldSeats = bus.bookings.reduce((a, b) => a + b.seats, 0);
  if (soldSeats + seats > bus.capacity) {
    return NextResponse.json(
      { error: `Solo quedan ${bus.capacity - soldSeats} plazas en este bus` },
      { status: 409 }
    );
  }

  const price = Number(trip.event.pricePerSeat);
  const totalPrice = seats * price;

  // Crear booking PENDING (qrToken en 2 pasos: necesita el id)
  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      busId: bus.id,
      seats,
      totalPrice,
      qrToken: "pending",
    },
  });
  const qrToken = generateQrToken(booking.id);
  await prisma.booking.update({
    where: { id: booking.id },
    data: { qrToken },
  });

  // Stripe Checkout Session
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(price * 100),
          product_data: {
            name: `Bus a ${trip.event.title}`,
            description: `Salida desde ${trip.originCity} · ${seats} plaza(s)`,
            images: trip.event.imageUrl ? [trip.event.imageUrl] : undefined,
          },
        },
        quantity: seats,
      },
    ],
    metadata: {
      bookingId: booking.id,
      busId: bus.id,
      userId: user.id,
    },
    payment_intent_data: {
      metadata: { bookingId: booking.id },
    },
    success_url: `${appUrl}/reservar/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/evento/${trip.event.slug}?rrpp=${trip.rrpp.code}&salida=${trip.originCity}&cancelled=true`,
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url, bookingId: booking.id });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/resend";
import { refundIssuedHtml } from "@/lib/email-templates";

// POST /api/admin/trips/[id]/refund — reembolso masivo de todos los bookings
// PAID del viaje (bus no confirmado o cancelación).
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      event: true,
      buses: {
        include: {
          bookings: {
            where: { status: "PAID" },
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
    },
  });
  if (!trip) {
    return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });
  }

  const bookings = trip.buses.flatMap((b) => b.bookings);
  if (bookings.length === 0) {
    return NextResponse.json({ error: "No hay pagos que reembolsar" }, { status: 409 });
  }

  let refunded = 0;
  let failed = 0;
  let totalAmount = 0;

  for (const booking of bookings) {
    try {
      if (booking.stripeSessionId) {
        const session = await stripe.checkout.sessions.retrieve(
          booking.stripeSessionId
        );
        if (session.payment_intent) {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
          });
        }
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "REFUNDED" },
      });
      refunded++;
      totalAmount += Number(booking.totalPrice);

      try {
        await sendEmail({
          to: booking.user.email,
          subject: `💸 Reembolso procesado — ${trip.event.title}`,
          html: refundIssuedHtml({
            name: booking.user.name ?? "viajero/a",
            eventTitle: trip.event.title,
            total: `${Number(booking.totalPrice).toFixed(2)}€`,
          }),
        });
      } catch (e) {
        console.error(`Error email reembolso ${booking.user.email}:`, e);
      }
    } catch (e) {
      console.error(`Error reembolsando booking ${booking.id}:`, e);
      failed++;
    }
  }

  // Marcar viaje como cancelado
  await prisma.$transaction([
    prisma.trip.update({ where: { id: trip.id }, data: { status: "CANCELLED" } }),
    prisma.bus.updateMany({
      where: { tripId: trip.id },
      data: { status: "CANCELLED" },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    refunded,
    failed,
    totalAmount: Math.round(totalAmount * 100) / 100,
  });
}

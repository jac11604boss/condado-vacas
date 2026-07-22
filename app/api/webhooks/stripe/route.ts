import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { markBookingPaid } from "@/lib/bookings";
import type Stripe from "stripe";

// POST /api/webhooks/stripe
// checkout.session.completed → Booking PAID + auto-apertura de bus + emails
// charge.refunded → Booking REFUNDED
export async function POST(request: Request) {
  const body = await request.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret) {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Sin firma" }, { status: 400 });
    }
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("❌ Webhook firma inválida:", err);
      return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
    }
  } else {
    // Dev local sin stripe CLI: parsear sin verificar (⚠️ solo desarrollo)
    console.warn("⚠️ STRIPE_WEBHOOK_SECRET no configurado — sin verificación de firma");
    event = JSON.parse(body) as Stripe.Event;
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (!bookingId) {
        console.error("checkout.session.completed sin bookingId", session.id);
        break;
      }
      await markBookingPaid(bookingId);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const bookingId = charge.metadata?.bookingId;
      if (bookingId) {
        await prisma.booking.updateMany({
          where: { id: bookingId, status: { in: ["PAID", "CHECKED_IN"] } },
          data: { status: "REFUNDED" },
        });
      }
      break;
    }

    default:
      // Eventos no manejados: OK
      break;
  }

  return NextResponse.json({ received: true });
}

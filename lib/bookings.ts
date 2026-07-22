import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import {
  bookingConfirmedHtml,
  busFullRrppHtml,
} from "@/lib/email-templates";
import type { Prisma } from "@/lib/generated/prisma/client";

// Marca un booking como PAID tras el pago (webhook o página de confirmación).
// Idempotente. Auto-abre el siguiente bus si se llena y notifica al RRPP.
export async function markBookingPaid(bookingId: string): Promise<{
  alreadyPaid: boolean;
  busFilled: boolean;
}> {
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        bus: { include: { trip: { include: { event: true, rrpp: { include: { user: true } } } } } },
      },
    });

    if (!booking) throw new Error("Booking no encontrado");
    if (booking.status === "PAID" || booking.status === "CHECKED_IN") {
      return { alreadyPaid: true, busFilled: false, booking };
    }

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "PAID" },
    });

    // ¿Se llenó el bus?
    const agg = await tx.booking.aggregate({
      where: { busId: booking.busId, status: { in: ["PAID", "CHECKED_IN"] } },
      _sum: { seats: true },
    });
    const sold = agg._sum.seats ?? 0;
    let busFilled = false;

    if (sold >= booking.bus.capacity) {
      await tx.bus.update({
        where: { id: booking.busId },
        data: { status: "FULL" },
      });
      await tx.bus.create({
        data: {
          tripId: booking.bus.tripId,
          number: booking.bus.number + 1,
          capacity: booking.bus.capacity,
        },
      });
      busFilled = true;
    }

    return { alreadyPaid: false, busFilled, booking };
  });

  // Emails fuera de la transacción (best-effort)
  const { booking } = result as {
    booking: Prisma.BookingGetPayload<{
      include: {
        user: true;
        bus: { include: { trip: { include: { event: true; rrpp: { include: { user: true } } } } } };
      };
    }>;
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const bookingUrl = `${appUrl}/mi-cuenta/reservas/${booking.id}`;

  try {
    await sendEmail({
      to: booking.user.email,
      subject: `🎉 Reserva confirmada — ${booking.bus.trip.event.title}`,
      html: bookingConfirmedHtml({
        name: booking.user.name ?? "viajero/a",
        eventTitle: booking.bus.trip.event.title,
        eventDate: booking.bus.trip.event.startDate.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        originCity: booking.bus.trip.originCity,
        seats: booking.seats,
        total: `${Number(booking.totalPrice).toFixed(2)}€`,
        bookingUrl,
      }),
    });
  } catch (e) {
    console.error("Error enviando email de confirmación:", e);
  }

  if (result.busFilled) {
    try {
      await sendEmail({
        to: booking.bus.trip.rrpp.user.email,
        subject: `🚀 ¡Bus lleno! — ${booking.bus.trip.event.title}`,
        html: busFullRrppHtml({
          name: booking.bus.trip.rrpp.user.name ?? "RRPP",
          eventTitle: booking.bus.trip.event.title,
          originCity: booking.bus.trip.originCity,
          busNumber: booking.bus.number,
        }),
      });
    } catch (e) {
      console.error("Error enviando email de bus lleno:", e);
    }
  }

  return { alreadyPaid: result.alreadyPaid, busFilled: result.busFilled };
}

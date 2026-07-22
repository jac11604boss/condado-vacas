import Link from "next/link";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { markBookingPaid } from "@/lib/bookings";
import { getCurrentUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirmación de reserva" };

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/mi-cuenta/reservas");

  const sessionId = searchParams.session_id;
  if (!sessionId) redirect("/mi-cuenta/reservas");

  let error: string | null = null;
  let bookingId: string | null = null;
  let eventTitle: string | null = null;
  let seats: number | null = null;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    bookingId = session.metadata?.bookingId ?? null;

    if (!bookingId) {
      error = "Sesión de pago no válida.";
    } else if (session.payment_status === "paid") {
      // Fallback si el webhook aún no llegó (idempotente)
      await markBookingPaid(bookingId);
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { bus: { include: { trip: { include: { event: true } } } } },
      });
      eventTitle = booking?.bus.trip.event.title ?? null;
      seats = booking?.seats ?? null;
    } else {
      error = "El pago no se ha completado.";
    }
  } catch (e) {
    console.error("Error verificando sesión:", e);
    error = "No se pudo verificar el pago.";
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
        {error ? (
          <>
            <XCircle className="mx-auto size-14 text-destructive" />
            <h1 className="mt-4 font-display text-3xl tracking-wide">
              ALGO FALLÓ
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Link
              href="/eventos"
              className={cn(buttonVariants({ variant: "outline" }), "mt-6 w-full")}
            >
              Volver a eventos
            </Link>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto size-14 text-forest" />
            <h1 className="mt-4 font-display text-3xl tracking-wide">
              ¡PLAZA <span className="text-brand">RESERVADA</span>! 🎉
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {seats && eventTitle
                ? `${seats} plaza(s) para ${eventTitle}. `
                : ""}
              Te avisaremos por email cuando el bus se confirme con el punto de
              encuentro y la hora exacta.
            </p>
            {bookingId && (
              <Link
                href={`/mi-cuenta/reservas/${bookingId}`}
                className={cn(buttonVariants(), "mt-6 w-full")}
              >
                Ver mi reserva y QR
              </Link>
            )}
            <Link
              href="/mi-cuenta/reservas"
              className={cn(buttonVariants({ variant: "outline" }), "mt-3 w-full")}
            >
              Ver todas mis reservas
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

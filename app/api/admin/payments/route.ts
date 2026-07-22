import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/payments — transacciones: cobros a clientes + payouts a RRPP
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // INGRESO_CLIENTE | PAGO_RRPP | null

  const [bookings, payouts] = await Promise.all([
    type === "PAGO_RRPP"
      ? Promise.resolve([])
      : prisma.booking.findMany({
          where: { status: { in: ["PAID", "CHECKED_IN", "REFUNDED"] } },
          include: {
            user: { select: { name: true, email: true } },
            bus: { include: { trip: { include: { event: { select: { title: true } } } } } },
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
    type === "INGRESO_CLIENTE"
      ? Promise.resolve([])
      : prisma.payout.findMany({
          include: {
            rrpp: { select: { code: true, user: { select: { name: true } } } },
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
  ]);

  const transactions = [
    ...bookings.map((b) => ({
      id: b.id,
      date: b.createdAt.toISOString(),
      type: "INGRESO_CLIENTE" as const,
      who: b.user.name ?? b.user.email,
      concept: `${b.bus.trip.event.title} · ${b.seats} plaza(s)`,
      amount: Number(b.totalPrice),
      status: b.status,
    })),
    ...payouts.map((p) => ({
      id: p.id,
      date: p.createdAt.toISOString(),
      type: "PAGO_RRPP" as const,
      who: p.rrpp.user.name ?? p.rrpp.code,
      concept: `Comisión @${p.rrpp.code}`,
      amount: Number(p.amount),
      status: p.status,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({ transactions });
}

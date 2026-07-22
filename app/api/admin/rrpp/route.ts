import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcRrppEarnings } from "@/lib/commissions";

// GET /api/admin/rrpp — lista de RRPP con métricas
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const profiles = await prisma.rrppProfile.findMany({
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      trips: {
        include: {
          event: { select: { pricePerSeat: true, rrppCommissionPct: true } },
          buses: {
            include: {
              bookings: {
                where: { status: { in: ["PAID", "CHECKED_IN"] } },
                select: { seats: true },
              },
            },
          },
        },
      },
      payouts: { where: { status: "PAID" }, select: { amount: true } },
    },
    orderBy: { appliedAt: "desc" },
  });

  return NextResponse.json({
    rrpps: profiles.map((p) => {
      const soldSeats = p.trips.reduce(
        (a, t) => a + t.buses.reduce((x, b) => x + b.bookings.reduce((y, bk) => y + bk.seats, 0), 0),
        0
      );
      const earnings = p.trips.reduce((acc, t) => {
        const tripSeats = t.buses.reduce(
          (x, b) => x + b.bookings.reduce((y, bk) => y + bk.seats, 0),
          0
        );
        return (
          acc +
          calcRrppEarnings(
            tripSeats,
            Number(t.event.pricePerSeat ?? 0),
            Number(t.event.rrppCommissionPct)
          )
        );
      }, 0);

      return {
        id: p.id,
        code: p.code,
        status: p.status,
        name: p.user.name,
        email: p.user.email,
        instagram: p.instagram,
        tiktok: p.tiktok,
        city: p.city,
        bio: p.bio,
        stripeAccountId: p.stripeAccountId,
        appliedAt: p.appliedAt.toISOString(),
        tripsCount: p.trips.length,
        soldSeats,
        earnings: Math.round(earnings * 100) / 100,
        paidOut: Math.round(p.payouts.reduce((a, x) => a + Number(x.amount), 0) * 100) / 100,
      };
    }),
  });
}

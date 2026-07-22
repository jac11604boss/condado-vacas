import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcRrppEarnings } from "@/lib/commissions";

// GET /api/admin/dashboard — KPIs + datos para gráficos
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    rrppTotal,
    rrppApproved,
    rrppPending,
    eventsActive,
    busesOpen,
    busesConfirmed,
    monthBookings,
    payouts,
    allPaidBookings,
    upcomingEvents,
  ] = await Promise.all([
    prisma.rrppProfile.count(),
    prisma.rrppProfile.count({ where: { status: "APPROVED" } }),
    prisma.rrppProfile.count({ where: { status: "PENDING" } }),
    prisma.event.count({ where: { isActive: true } }),
    prisma.bus.count({ where: { status: "OPEN" } }),
    prisma.bus.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.findMany({
      where: { status: { in: ["PAID", "CHECKED_IN"] }, createdAt: { gte: monthStart } },
      select: { seats: true, totalPrice: true },
    }),
    prisma.payout.findMany({ where: { status: "PAID" }, select: { amount: true } }),
    prisma.booking.findMany({
      where: { status: { in: ["PAID", "CHECKED_IN"] }, createdAt: { gte: sixMonthsAgo } },
      include: {
        bus: { include: { trip: { include: { event: true, rrpp: { include: { user: { select: { name: true } } } } } } } },
      },
    }),
    prisma.event.findMany({
      where: { isActive: true, startDate: { gte: now } },
      include: { trips: { include: { buses: true } } },
      orderBy: { startDate: "asc" },
      take: 8,
    }),
  ]);

  // KPIs
  const monthSeats = monthBookings.reduce((a, b) => a + b.seats, 0);
  const monthRevenue = monthBookings.reduce((a, b) => a + Number(b.totalPrice), 0);
  const commissionsPaid = payouts.reduce((a, p) => a + Number(p.amount), 0);

  // Ventas por provincia
  const byProvince = new Map<string, number>();
  for (const b of allPaidBookings) {
    const prov = b.bus.trip.event.province || "—";
    byProvince.set(prov, (byProvince.get(prov) ?? 0) + b.seats);
  }

  // Ventas por mes (últimos 6)
  const byMonth = new Map<string, { seats: number; revenue: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, { seats: 0, revenue: 0 });
  }
  for (const b of allPaidBookings) {
    const d = new Date(b.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = byMonth.get(key);
    if (entry) {
      entry.seats += b.seats;
      entry.revenue += Number(b.totalPrice);
    }
  }

  // Top RRPP
  const rrppMap = new Map<string, { name: string; seats: number; earnings: number }>();
  for (const b of allPaidBookings) {
    const rrpp = b.bus.trip.rrpp;
    const key = rrpp.code;
    const entry = rrppMap.get(key) ?? { name: rrpp.user.name ?? key, seats: 0, earnings: 0 };
    entry.seats += b.seats;
    entry.earnings += calcRrppEarnings(
      b.seats,
      Number(b.bus.trip.event.pricePerSeat ?? 0),
      Number(b.bus.trip.event.rrppCommissionPct)
    );
    rrppMap.set(key, entry);
  }
  const topRrpp = Array.from(rrppMap.entries())
    .map(([code, v]) => ({ code, ...v, earnings: Math.round(v.earnings * 100) / 100 }))
    .sort((a, b) => b.seats - a.seats)
    .slice(0, 5);

  // Distribución por tipo de evento
  const byCategory = new Map<string, number>();
  for (const b of allPaidBookings) {
    const cat = b.bus.trip.event.category;
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + b.seats);
  }

  return NextResponse.json({
    kpis: {
      rrppTotal,
      rrppApproved,
      rrppPending,
      eventsActive,
      busesOpen,
      busesConfirmed,
      monthSeats,
      monthRevenue: Math.round(monthRevenue * 100) / 100,
      commissionsPaid: Math.round(commissionsPaid * 100) / 100,
    },
    charts: {
      salesByProvince: Array.from(byProvince.entries()).map(([province, seats]) => ({ province, seats })),
      salesByMonth: Array.from(byMonth.entries()).map(([month, v]) => ({ month, ...v })),
      topRrpp,
      categoryDistribution: Array.from(byCategory.entries()).map(([category, seats]) => ({ category, seats })),
    },
    topRrppTable: topRrpp,
    upcomingEvents: upcomingEvents.map((e) => ({
      id: e.id,
      title: e.title,
      startDate: e.startDate.toISOString(),
      municipality: e.municipality,
      trips: e.trips.length,
      buses: e.trips.reduce((a, t) => a + t.buses.length, 0),
      hasConfirmedBus: e.trips.some((t) => t.buses.some((b) => b.status === "CONFIRMED")),
    })),
  });
}

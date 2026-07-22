import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminEventSchema } from "@/lib/validators/admin";

const PAGE_SIZE = 15;

// GET /api/admin/events — lista con filtros, búsqueda y paginación
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const search = searchParams.get("search");
  const province = searchParams.get("province");
  const category = searchParams.get("category");
  const source = searchParams.get("source");
  const active = searchParams.get("active"); // "true" | "false" | null

  const where = {
    ...(search && { title: { contains: search, mode: "insensitive" as const } }),
    ...(province && { province }),
    ...(category && { category }),
    ...(source && { source: source as "SCRAPED" | "CUSTOM" }),
    ...(active === "true" && { isActive: true }),
    ...(active === "false" && { isActive: false }),
  };

  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      include: { _count: { select: { trips: true } } },
      orderBy: { startDate: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return NextResponse.json({
    total,
    page,
    pages: Math.ceil(total / PAGE_SIZE),
    events: events.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      startDate: e.startDate.toISOString(),
      municipality: e.municipality,
      province: e.province,
      category: e.category,
      source: e.source,
      isActive: e.isActive,
      pricePerSeat: e.pricePerSeat ? Number(e.pricePerSeat) : null,
      rrppCommissionPct: Number(e.rrppCommissionPct),
      minSeats: e.minSeats,
      busCapacity: e.busCapacity,
      tripsCount: e._count.trips,
    })),
  });
}

// POST /api/admin/events — crear evento manualmente
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const parsed = createAdminEventSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }
  const v = parsed.data;

  const baseSlug = v.title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const event = await prisma.event.create({
    data: {
      slug: `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`,
      title: v.title,
      description: v.description || null,
      category: v.category,
      startDate: new Date(v.startDate),
      endDate: v.endDate ? new Date(v.endDate) : null,
      location: v.location || v.municipality,
      municipality: v.municipality,
      province: v.province,
      imageUrl: v.imageUrl || null,
      source: "CUSTOM",
      createdById: user.id,
      pricePerSeat: v.pricePerSeat ?? null,
      ...(v.rrppCommissionPct !== undefined && { rrppCommissionPct: v.rrppCommissionPct }),
      ...(v.minSeats !== undefined && { minSeats: v.minSeats }),
      ...(v.busCapacity !== undefined && { busCapacity: v.busCapacity }),
    },
  });

  return NextResponse.json({ ok: true, eventId: event.id });
}

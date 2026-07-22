import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/events — calendario completo para RRPP (eventos activos futuros)
// Filtros: province, category, from, to
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "RRPP" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const province = searchParams.get("province");
  const category = searchParams.get("category");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const events = await prisma.event.findMany({
    where: {
      isActive: true,
      ...(province && { province }),
      ...(category && { category }),
      startDate: {
        gte: from ? new Date(from) : new Date(Date.now() - 86400000),
        ...(to && { lte: new Date(to) }),
      },
    },
    include: { trips: { select: { rrppId: true } } },
    orderBy: { startDate: "asc" },
  });

  const myRrppId = user.rrppProfile?.id;

  return NextResponse.json({
    events: events.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      description: e.description,
      imageUrl: e.imageUrl,
      category: e.category,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate?.toISOString() ?? null,
      municipality: e.municipality,
      province: e.province,
      lat: e.lat,
      lng: e.lng,
      pricePerSeat: e.pricePerSeat ? Number(e.pricePerSeat) : null,
      source: e.source,
      enabledByMe: myRrppId ? e.trips.some((t) => t.rrppId === myRrppId) : false,
      enabledCount: e.trips.length,
    })),
  });
}

// POST /api/events — crear evento propio (RRPP aprobado)
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (
    !user ||
    (user.role !== "RRPP" && user.role !== "ADMIN") ||
    (user.role === "RRPP" && user.rrppProfile?.status !== "APPROVED")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { createEventSchema } = await import("@/lib/validators/trip");
  const parsed = createEventSchema.safeParse(await request.json());
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
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

  const event = await prisma.event.create({
    data: {
      slug,
      title: v.title,
      description: v.description || null,
      category: v.category,
      startDate: new Date(v.startDate),
      endDate: v.endDate ? new Date(v.endDate) : null,
      location: v.location || v.municipality,
      municipality: v.municipality,
      province: v.province,
      imageUrl: v.imageUrl || null,
      lat: v.lat ?? null,
      lng: v.lng ?? null,
      source: "CUSTOM",
      createdById: user.id,
      // Sin precio: lo fija el admin
    },
  });

  return NextResponse.json({ ok: true, eventId: event.id, slug: event.slug });
}

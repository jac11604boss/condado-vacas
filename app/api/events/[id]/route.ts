import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events/[id] — detalle completo de evento
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    event: {
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description,
      category: event.category,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString() ?? null,
      location: event.location,
      municipality: event.municipality,
      province: event.province,
      imageUrl: event.imageUrl,
      lat: event.lat,
      lng: event.lng,
      isActive: event.isActive,
      pricePerSeat: event.pricePerSeat ? Number(event.pricePerSeat) : null,
      rrppCommissionPct: Number(event.rrppCommissionPct),
      minSeats: event.minSeats,
      busCapacity: event.busCapacity,
    },
  });
}

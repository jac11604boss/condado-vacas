import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateEventSchema } from "@/lib/validators/admin";

// PATCH /api/admin/events/[id] — actualizar evento (precio, comisión, mínimo…)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const parsed = updateEventSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }
  const v = parsed.data;

  const event = await prisma.event.update({
    where: { id: params.id },
    data: {
      ...(v.title !== undefined && { title: v.title }),
      ...(v.description !== undefined && { description: v.description }),
      ...(v.category !== undefined && { category: v.category }),
      ...(v.startDate !== undefined && { startDate: new Date(v.startDate) }),
      ...(v.endDate !== undefined && {
        endDate: v.endDate ? new Date(v.endDate) : null,
      }),
      ...(v.location !== undefined && { location: v.location }),
      ...(v.municipality !== undefined && { municipality: v.municipality }),
      ...(v.province !== undefined && { province: v.province }),
      ...(v.imageUrl !== undefined && { imageUrl: v.imageUrl }),
      ...(v.lat !== undefined && { lat: v.lat }),
      ...(v.lng !== undefined && { lng: v.lng }),
      ...(v.isActive !== undefined && { isActive: v.isActive }),
      ...(v.pricePerSeat !== undefined && { pricePerSeat: v.pricePerSeat }),
      ...(v.rrppCommissionPct !== undefined && {
        rrppCommissionPct: v.rrppCommissionPct,
      }),
      ...(v.minSeats !== undefined && { minSeats: v.minSeats }),
      ...(v.busCapacity !== undefined && { busCapacity: v.busCapacity }),
    },
  });

  return NextResponse.json({ ok: true, eventId: event.id });
}

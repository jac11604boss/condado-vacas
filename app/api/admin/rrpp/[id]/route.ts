import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "DISABLED", "PENDING"]),
});

// PATCH /api/admin/rrpp/[id] — aprobar / rechazar / desactivar
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const profile = await prisma.rrppProfile.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      ...(parsed.data.status === "APPROVED" && { approvedAt: new Date() }),
    },
  });

  // Si se desactiva/rechaza, el usuario vuelve a CLIENT si no tiene trips activos
  if (parsed.data.status === "DISABLED" || parsed.data.status === "REJECTED") {
    const activeTrips = await prisma.trip.count({
      where: { rrppId: profile.id, status: "OPEN" },
    });
    if (activeTrips === 0) {
      await prisma.user.update({
        where: { id: profile.userId },
        data: { role: "CLIENT" },
      });
    }
  }

  return NextResponse.json({ ok: true, status: profile.status });
}

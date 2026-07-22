import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateRrppCode } from "@/lib/rrpp";
import { ensureUserProfile } from "@/lib/auth";
import { rrppApplySchema } from "@/lib/validators/auth";

// POST /api/rrpp/apply
// Cliente logueado que solicita ser RRPP → RrppProfile PENDING + role=RRPP.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = rrppApplySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { instagram, tiktok, city, bio } = parsed.data;

  const user = await ensureUserProfile(authUser);

  const existing = await prisma.rrppProfile.findUnique({
    where: { userId: user.id },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Ya tienes una solicitud", status: existing.status },
      { status: 409 }
    );
  }

  const code = await generateRrppCode(user.name ?? authUser.email!.split("@")[0]);

  await prisma.$transaction([
    prisma.rrppProfile.create({
      data: { userId: user.id, code, instagram, tiktok, city, bio, status: "PENDING" },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { role: "RRPP" },
    }),
  ]);

  return NextResponse.json({ ok: true, code, status: "PENDING" });
}

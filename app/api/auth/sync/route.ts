import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { generateRrppCode } from "@/lib/rrpp";
import { syncProfileSchema } from "@/lib/validators/auth";

// POST /api/auth/sync
// Llamado justo después de supabase.auth.signUp desde el cliente.
// Crea la fila en User (y RrppProfile PENDING si role=RRPP).
// Verifica con service_role que el userId existe realmente en Supabase Auth.
export async function POST(request: Request) {
  const parsed = syncProfileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { userId, name, phone, role, instagram, tiktok, city } = parsed.data;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user?.email) {
    return NextResponse.json(
      { error: "Usuario no encontrado en Auth" },
      { status: 404 }
    );
  }

  const user = await prisma.user.upsert({
    where: { supabaseId: userId },
    update: { name, phone },
    create: {
      supabaseId: userId,
      email: data.user.email,
      name,
      phone,
      role,
    },
  });

  let rrppCode: string | null = null;
  if (role === "RRPP") {
    const existingProfile = await prisma.rrppProfile.findUnique({
      where: { userId: user.id },
    });
    if (existingProfile) {
      rrppCode = existingProfile.code;
    } else {
      rrppCode = await generateRrppCode(name);
      await prisma.rrppProfile.create({
        data: {
          userId: user.id,
          code: rrppCode,
          instagram,
          tiktok,
          city,
          status: "PENDING",
        },
      });
    }
  }

  return NextResponse.json({ ok: true, role, rrppCode });
}

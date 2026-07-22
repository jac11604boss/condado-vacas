import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/auth/me — perfil del usuario autenticado (para redirección por rol)
export async function GET() {
  const supabase = createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Garantiza fila en User (p.ej. primer login con Google OAuth)
  await ensureUserProfile(authUser);

  const user = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    include: { rrppProfile: { select: { status: true, code: true } } },
  });

  return NextResponse.json({
    role: user?.role ?? "CLIENT",
    rrppStatus: user?.rrppProfile?.status ?? null,
    rrppCode: user?.rrppProfile?.code ?? null,
  });
}

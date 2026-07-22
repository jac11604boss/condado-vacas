import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/webhooks/supabase-auth
// Webhook de Supabase (Database Webhook sobre auth.users INSERT).
// Fallback: garantiza que TODO usuario de Auth acaba en la tabla User
// con role=CLIENT. Configurar en Supabase Dashboard → Database → Webhooks
// con header: x-webhook-secret = SUPABASE_AUTH_WEBHOOK_SECRET.
export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (
    !process.env.SUPABASE_AUTH_WEBHOOK_SECRET ||
    secret !== process.env.SUPABASE_AUTH_WEBHOOK_SECRET
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = await request.json();

  if (payload?.type === "INSERT" && payload?.table === "users") {
    const record = payload.record;
    const meta = record.raw_user_meta_data ?? {};

    await prisma.user.upsert({
      where: { supabaseId: record.id },
      update: {},
      create: {
        supabaseId: record.id,
        email: record.email,
        name: meta.full_name ?? meta.name ?? null,
        phone: meta.phone ?? null,
        avatarUrl: meta.avatar_url ?? null,
        role: "CLIENT",
      },
    });
  }

  return NextResponse.json({ ok: true });
}

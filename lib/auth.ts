import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Devuelve el usuario de la tabla User (con su perfil RRPP) a partir de la
 * sesión de Supabase Auth. null si no hay sesión.
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { rrppProfile: true },
  });
}

/**
 * Garantiza que existe una fila en User para el usuario de Supabase Auth
 * (p.ej. tras login con Google OAuth). Crea con role=CLIENT por defecto.
 */
export async function ensureUserProfile(authUser: SupabaseAuthUser) {
  const existing = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
  });
  if (existing) return existing;

  const meta = authUser.user_metadata ?? {};
  return prisma.user.create({
    data: {
      supabaseId: authUser.id,
      email: authUser.email!,
      name: meta.full_name ?? meta.name ?? null,
      avatarUrl: meta.avatar_url ?? null,
      role: "CLIENT",
    },
  });
}

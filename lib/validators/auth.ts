import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
export type LoginInput = z.infer<typeof loginSchema>;

const baseRegister = {
  name: z.string().min(2, "Dinos tu nombre"),
  email: z.email("Email no válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  phone: z.string().min(9, "Teléfono no válido"),
};

export const registerClientSchema = z.object(baseRegister);
export type RegisterClientInput = z.infer<typeof registerClientSchema>;

export const registerRrppSchema = z.object({
  ...baseRegister,
  instagram: z.string().min(2, "Tu @ de Instagram es clave para aprobarte"),
  tiktok: z.string().optional(),
  city: z.string().min(2, "¿Desde qué ciudad/pueblo te mueves?"),
});
export type RegisterRrppInput = z.infer<typeof registerRrppSchema>;

export const rrppApplySchema = z.object({
  instagram: z.string().min(2, "Tu @ de Instagram es clave para aprobarte"),
  tiktok: z.string().optional(),
  city: z.string().min(2, "¿Desde qué ciudad/pueblo te mueves?"),
  bio: z.string().max(280).optional(),
});
export type RrppApplyInput = z.infer<typeof rrppApplySchema>;

/** Body del endpoint /api/auth/sync (post-registro) */
export const syncProfileSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(2),
  phone: z.string().min(9),
  role: z.enum(["CLIENT", "RRPP"]).default("CLIENT"),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  city: z.string().optional(),
});
export type SyncProfileInput = z.infer<typeof syncProfileSchema>;

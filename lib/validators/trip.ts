import { z } from "zod";

export const enableTripSchema = z.object({
  eventId: z.string().min(1),
  originCity: z
    .string()
    .min(2, "Escribe la ciudad/pueblo de salida")
    .max(60),
});
export type EnableTripInput = z.infer<typeof enableTripSchema>;

/** Normaliza "Mondariz " → "mondariz" para el enlace */
export function normalizeCity(city: string): string {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const createEventSchema = z.object({
  title: z.string().min(3, "Título demasiado corto").max(120),
  description: z.string().max(2000).optional(),
  category: z.enum([
    "fiesta-tradicional",
    "romeria",
    "festival",
    "concierto",
    "deporte",
    "feria",
    "espectaculo",
    "fiesta-privada",
  ]),
  startDate: z.string().min(1, "Fecha de inicio obligatoria"),
  endDate: z.string().optional(),
  municipality: z.string().min(2, "Municipio obligatorio"),
  province: z.enum(["A Coruña", "Lugo", "Ourense", "Pontevedra"]),
  location: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  lat: z.number().optional(),
  lng: z.number().optional(),
});
export type CreateEventInput = z.infer<typeof createEventSchema>;

import { z } from "zod";

export const updateEventSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  location: z.string().optional(),
  municipality: z.string().optional(),
  province: z.enum(["A Coruña", "Lugo", "Ourense", "Pontevedra"]).optional(),
  imageUrl: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
  pricePerSeat: z.number().positive().nullable().optional(),
  rrppCommissionPct: z.number().min(0).max(50).optional(),
  minSeats: z.number().int().min(5).max(55).optional(),
  busCapacity: z.number().int().min(10).max(70).optional(),
});
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const confirmBusSchema = z.object({
  busId: z.string().min(1),
  meetingPoint: z.string().min(3, "Punto de encuentro obligatorio"),
  departureTime: z.string().min(1, "Hora de salida obligatoria"),
  returnTime: z.string().optional(),
  busCompany: z.string().min(2, "Empresa obligatoria"),
  busPlate: z.string().optional(),
  driverName: z.string().min(2, "Nombre del conductor obligatorio"),
  driverPhone: z.string().min(9, "Teléfono obligatorio"),
  driverEmail: z.string().email("Email del conductor no válido").optional().or(z.literal("")),
  routeNotes: z.string().optional(),
});
export type ConfirmBusInput = z.infer<typeof confirmBusSchema>;

export const checkinSchema = z.object({
  qrToken: z.string().min(10),
});
export type CheckinInput = z.infer<typeof checkinSchema>;

export const createAdminEventSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional(),
  category: z.string().min(2),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  municipality: z.string().min(2),
  province: z.enum(["A Coruña", "Lugo", "Ourense", "Pontevedra"]),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
  pricePerSeat: z.number().positive().optional(),
  rrppCommissionPct: z.number().min(0).max(50).optional(),
  minSeats: z.number().int().min(5).max(55).optional(),
  busCapacity: z.number().int().min(10).max(70).optional(),
});
export type CreateAdminEventInput = z.infer<typeof createAdminEventSchema>;

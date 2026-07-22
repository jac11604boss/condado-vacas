import { z } from "zod";

export const createBookingSchema = z.object({
  tripId: z.string().min(1),
  seats: z.number().int().min(1).max(10),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

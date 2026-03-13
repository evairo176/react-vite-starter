import { z } from "zod";

export const CreateBookingSchema = z.object({
  name: z.string().min(2, "Nama wajib diisi"),
  title: z.string().min(2, "Judul wajib diisi"),
  description: z.string().optional(),
  requestType: z.enum([
    "SOFTWARE",
    "LAPTOP",
    "PRINTER",
    "NETWORK",
    "DOXA_REVISION",
    "OTHER",
  ]),
  doxaReason: z.array(z.string()).optional(),

  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export type CreateBookingDTO = z.infer<typeof CreateBookingSchema>;

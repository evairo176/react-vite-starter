import { z } from "zod";

export const AssignTicketSchema = z.object({
  picId: z.string().min(1, "PIC wajib dipilih"),
});

export type AssignTicketDTO = z.infer<typeof AssignTicketSchema>;

import { z } from "zod";

/**
 * Payload submitted by the Contact_Form via `POST /contact`. (Req 5.3)
 */
export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  body: string;
}

/**
 * Validation schema for the Contact_Form (RHF + zod resolver).
 * Requires a name, a valid email, a subject, and a non-empty body so that
 * submission is blocked client-side until all fields are valid. (Req 5.2, 13.3)
 */
export const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message is required"),
});

export type ContactDTO = z.infer<typeof ContactSchema>;

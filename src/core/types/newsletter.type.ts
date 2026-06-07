import { z } from "zod";

/**
 * Payload submitted by the Newsletter_Form via `POST /newsletter/subscribe`.
 * (Req 6.3)
 */
export interface NewsletterPayload {
  email: string;
}

/**
 * Validation schema for the Newsletter_Form (RHF + zod resolver).
 * Requires a valid email so subscription is blocked until the input is valid.
 * (Req 6.2, 13.3)
 */
export const NewsletterSchema = z.object({
  email: z.email("Enter a valid email"),
});

export type NewsletterDTO = z.infer<typeof NewsletterSchema>;

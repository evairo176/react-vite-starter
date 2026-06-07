import { z } from "zod";

/**
 * Achievement record returned by the public and admin endpoints. Surfaces a
 * single award / certification / milestone with optional metadata (issuer,
 * description, external credential url, icon, category) plus ordering and
 * publish state used by the admin manager and public section.
 */
export interface Achievement {
  id: string;
  title: string;
  issuer?: string | null;
  description?: string | null;
  date: string; // ISO date
  url?: string | null;
  icon?: string | null;
  category?: string | null; // "award" | "certification" | "milestone"
  position: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Validation schema for the Achievement create/edit form (RHF + zod resolver).
 * `title` is required; the descriptive fields are optional strings; `date` is a
 * required ISO date string sourced from an `<input type="date">`; `position` is
 * coerced from the numeric input; and `isPublished` defaults to published.
 */
export const CreateAchievementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  issuer: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  position: z.coerce.number().optional(),
  isPublished: z.boolean().optional().default(true),
});

export const UpdateAchievementSchema = CreateAchievementSchema;

export type CreateAchievementDTO = z.infer<typeof CreateAchievementSchema>;
export type UpdateAchievementDTO = z.infer<typeof UpdateAchievementSchema>;

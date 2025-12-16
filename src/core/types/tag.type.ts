import { z } from "zod";

export interface IPTag {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export const CreateTagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});

export const UpdateTagSchema = CreateTagSchema.partial();

export type CreateTagDTO = z.infer<typeof CreateTagSchema>;
export type UpdateTagDTO = z.infer<typeof UpdateTagSchema>;

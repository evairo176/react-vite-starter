import { z } from "zod";

export interface IPTechStack {
  id: string;
  name: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const CreateTechStackSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().optional(),
});

export const UpdateTechStackSchema = CreateTechStackSchema.partial();

export type CreateTechStackDTO = z.infer<typeof CreateTechStackSchema>;
export type UpdateTechStackDTO = z.infer<typeof UpdateTechStackSchema>;

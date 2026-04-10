import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

export const UpdateProductSchema = z.object({
  name: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;
export type UpdateProductDTO = z.infer<typeof UpdateProductSchema>;

export interface IProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

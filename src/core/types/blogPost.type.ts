import { z } from "zod";

export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  isPublished: boolean;
  totalViews: number;
  totalLikes: number;
  createdAt: string;
  updatedAt: string;
}

export const CreateBlogPostSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const UpdateBlogPostSchema = CreateBlogPostSchema;

export type CreateBlogPostDTO = z.infer<typeof CreateBlogPostSchema>;
export type UpdateBlogPostDTO = z.infer<typeof UpdateBlogPostSchema>;

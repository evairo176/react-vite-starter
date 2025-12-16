import type { IPCategory } from "./category.type";
import type { IPTag } from "./tag.type";
import type { IPTechStack } from "./techStack.type";
import { z } from "zod";

export interface IPPortfolio {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string;
  categoryId: string;
  isPublished: boolean;
  liveUrl: string;
  repoUrl: string;
  featured: boolean;
  metaTitle?: null | string;
  metaDesc: null | string;
  metaImage: null | string;
  createdAt: string;
  updatedAt: string;
  category: IPCategory;
  images: {
    id: string;
    portfolioId: string;
    url: string;
    alt: string;
    position: number;
  }[];
  tags: [
    {
      portfolioId: "bdef308a-20a9-4398-a800-416ac0349ad0";
      tagId: "f3f013bc-9b4b-4437-aa06-3c983e8b0d1b";
      tag: IPTag;
    }
  ];
  techStacks: [
    {
      portfolioId: "bdef308a-20a9-4398-a800-416ac0349ad0";
      techId: "16dc3d4d-fe4a-48cf-bbea-aac1962c9bb7";
      tech: IPTechStack;
    }
  ];
}

export const PortfolioImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional().nullable(),
  position: z.number().optional(),
});

export const CreatePortfolioSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  shortDesc: z.string().optional(),

  categoryId: z.string().optional(),

  liveUrl: z.string().nullable().optional(),
  repoUrl: z.string().nullable().optional(),

  featured: z.boolean(),
  isPublished: z.boolean(),

  images: z.array(PortfolioImageSchema).optional(),
  tagIds: z.array(z.string().min(1)).min(1, "Minimal 1 tag"),
  techIds: z.array(z.string().min(1)).min(1, "Minimal 1 tech"),
});

export const UpdatePortfolioSchema = CreatePortfolioSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreatePortfolioDTO = z.infer<typeof CreatePortfolioSchema>;
export type UpdatePortfolioDTO = z.infer<typeof UpdatePortfolioSchema>;

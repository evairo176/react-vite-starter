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

/** Blog category reference (Req 4.4). */
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

/** Blog tag reference (Req 4.4). */
export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

/** A related-post summary surfaced on the Blog_Detail_View (Req 4.11). */
export interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  coverImage?: string | null;
}

/** An approved/pending comment for a blog post (Req 4.7). */
export interface BlogComment {
  id: string;
  name: string;
  email?: string;
  content: string;
  status: "approved" | "pending";
  createdAt: string;
}

/**
 * Public blog-post detail shape returned by `GET /blog-posts/public/:slug`.
 * Extends the base post with category/tags, engagement counts, reading time,
 * and related posts rendered on the Blog_Detail_View. (Req 4.4, 4.7, 4.11)
 */
export interface PublicBlogPost extends IBlogPost {
  category?: BlogCategory | null;
  tags?: BlogTag[];
  reactionCount: number;
  totalViews: number;
  readingTime: number; // minutes (Reading_Time)
  relatedPosts?: RelatedPost[];
}

/**
 * Admin blog-post shape returned by the dashboard/admin list and detail
 * endpoints, which include the related category and tag join rows. Used by the
 * Admin_Blog_Manager to prefill the edit form with the current taxonomy
 * assignment. (Req 10.6)
 */
export interface AdminBlogPost extends IBlogPost {
  categoryId?: string | null;
  category?: BlogCategory | null;
  tags?: Array<{ tag: BlogTag } | BlogTag>;
}

export const CreateBlogPostSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  isPublished: z.boolean().optional(),

  // Taxonomy assignment from the Admin_Blog_Manager (Req 10.6).
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string().min(1)).optional(),
});

export const UpdateBlogPostSchema = CreateBlogPostSchema;

export type CreateBlogPostDTO = z.infer<typeof CreateBlogPostSchema>;
export type UpdateBlogPostDTO = z.infer<typeof UpdateBlogPostSchema>;

/**
 * Validation schema for the Comment_Form on the Blog_Detail_View
 * (RHF + zod resolver). Requires a name, a valid email, and content between
 * 1 and 2000 characters so submission is blocked until valid. (Req 4.10, 13.3)
 */
export const CommentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  content: z.string().min(1, "Comment is required").max(2000, "Comment is too long"),
});

export type CommentDTO = z.infer<typeof CommentSchema>;

/**
 * Admin comment row returned by `GET /blog-posts/comments`. Includes the
 * approval flag and the parent post reference so the moderation table can show
 * (and link to) which post each comment belongs to. (Req 4.7)
 */
export interface AdminComment {
  id: string;
  name: string;
  email: string;
  body: string;
  isApproved: boolean;
  createdAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

/**
 * Moderation counts returned by `GET /blog-posts/comments/count`, surfaced as
 * stat badges in the Admin comment manager. (Req 4.7)
 */
export interface AdminCommentCounts {
  pending: number;
  approved: number;
  total: number;
}

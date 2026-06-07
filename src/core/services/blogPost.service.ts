import api from "../api/axios";
import type {
  CommentDTO,
  CreateBlogPostDTO,
  UpdateBlogPostDTO,
} from "../types/blogPost.type";

/** Payload for submitting a reaction to a public blog post. (Req 4.5) */
export interface ReactionDTO {
  type?: string;
}

const blogPostService = {
  findAllAdmin: async (params?: string) => api.get(`/blog-posts?${params}`),
  findOne: async (id: string) => api.get(`/blog-posts/${id}`),
  create: async (payload: CreateBlogPostDTO) => api.post("/blog-posts", payload),
  update: async (id: string, payload: UpdateBlogPostDTO) =>
    api.put(`/blog-posts/${id}`, payload),
  destroy: async (id: string) => api.delete(`/blog-posts/${id}`),

  findAllPublic: async (params?: string) =>
    api.get(`/blog-posts/public${params ? `?${params}` : ""}`),
  getPublicBySlug: async (slug: string) =>
    api.get(`/blog-posts/public/${slug}`),
  incrementView: async (id: string) => api.post(`/blog-posts/${id}/view`),
  incrementLike: async (id: string) => api.post(`/blog-posts/${id}/like`),

  // Public comments and reactions for the Blog_Detail_View. (Req 4.7, 4.8, 4.5)
  getPublicComments: async (slug: string) =>
    api.get(`/blog-posts/public/${slug}/comments`),
  createComment: async (slug: string, dto: CommentDTO) =>
    api.post(`/blog-posts/public/${slug}/comments`, dto),
  createReaction: async (slug: string, dto: ReactionDTO) =>
    api.post(`/blog-posts/public/${slug}/reactions`, dto),
};

export default blogPostService;

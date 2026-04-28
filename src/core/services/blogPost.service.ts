import api from "../api/axios";
import type {
  CreateBlogPostDTO,
  UpdateBlogPostDTO,
} from "../types/blogPost.type";

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
};

export default blogPostService;

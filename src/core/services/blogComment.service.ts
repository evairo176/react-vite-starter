import api from "../api/axios";

/**
 * Admin blog-comment moderation data access over the shared Axios client.
 * Lists all comments (approved + pending) with status filtering, returns the
 * pending/approved/total counts, approves, and deletes. The public
 * submit/list-by-slug endpoints live on `blogPost.service`. (Req 4.7)
 */
const blogCommentService = {
  /** `GET /blog-posts/comments?<params>` — paginated moderation list. */
  listAdmin: async (params: string) =>
    api.get(`/blog-posts/comments?${params}`),

  /** `GET /blog-posts/comments/count` — pending/approved/total counts. */
  getCounts: async () => api.get(`/blog-posts/comments/count`),

  /** `POST /blog-posts/comments/:id/approve` — approve a pending comment. */
  approve: async (id: string) => api.post(`/blog-posts/comments/${id}/approve`),

  /** `DELETE /blog-posts/comments/:id` — delete a comment. */
  destroy: async (id: string) => api.delete(`/blog-posts/comments/${id}`),
};

export default blogCommentService;

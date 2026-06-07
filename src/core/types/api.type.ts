/**
 * Shared backend response envelope and pagination metadata.
 *
 * Models the standard portfolio backend response shape
 * `{ status, message, data, metadata }` (Req 13.1) and the pagination metadata
 * `{ total, page, limit, totalPages, hasNext, hasPrev }` used by list endpoints
 * to drive pagination controls (Req 13.2).
 */
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  metadata?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

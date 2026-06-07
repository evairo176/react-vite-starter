/**
 * A published testimonial returned by `GET /testimonial/public`, rendered by
 * the Testimonials_View. (Req 7.5)
 */
export interface Testimonial {
  id: string;
  author: string;
  message: string;
  role?: string | null;
  avatar?: string | null;
}

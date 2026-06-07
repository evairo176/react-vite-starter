import api from "../api/axios";

/**
 * Testimonials_View data access over the shared Axios client. (Req 7.1, 13.1)
 */
const testimonialService = {
  /** `GET /testimonial/public` — published testimonials. (Req 7.1) */
  getPublic: async () => api.get("/testimonial/public"),
};

export default testimonialService;

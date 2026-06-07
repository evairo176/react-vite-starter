import api from "../api/axios";
import type { NewsletterPayload } from "../types/newsletter.type";

/**
 * Newsletter_Form data access over the shared Axios client. (Req 6.3, 13.1)
 */
const newsletterService = {
  /** `POST /newsletter/subscribe` — subscribe an email. (Req 6.3) */
  subscribe: async (payload: NewsletterPayload) =>
    api.post("/newsletter/subscribe", payload),

  /** `GET /newsletter/unsubscribe?token=...` — unsubscribe via token. (Req 6.3) */
  unsubscribe: async (token: string) =>
    api.get(`/newsletter/unsubscribe?token=${encodeURIComponent(token)}`),
};

export default newsletterService;

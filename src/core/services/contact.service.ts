import api from "../api/axios";
import type { ContactPayload } from "../types/contact.type";

/**
 * Contact_Form data access over the shared Axios client. (Req 5.3, 13.1)
 */
const contactService = {
  /** `POST /contact` — submit a contact message. (Req 5.3) */
  submit: async (payload: ContactPayload) => api.post("/contact", payload),
};

export default contactService;

import api from "../api/axios";
import type {
  CreateAchievementDTO,
  UpdateAchievementDTO,
} from "../types/achievement.type";

/**
 * Achievements data access over the shared Axios client. Backs both the public
 * Achievements section and the Admin_Achievement_Manager. (Req 13.1)
 */
const achievementService = {
  /** `GET /achievements/public` — published achievements. */
  getPublic: async () => api.get("/achievements/public"),
  /** `GET /achievements?...` — paginated admin list. */
  findAllAdmin: async (params: string) => api.get(`/achievements?${params}`),
  /** `POST /achievements` — create a new achievement. */
  create: async (payload: CreateAchievementDTO) =>
    api.post("/achievements", payload),
  /** `PUT /achievements/:id` — update an achievement. */
  update: async (id: string, payload: UpdateAchievementDTO) =>
    api.put(`/achievements/${id}`, payload),
  /** `DELETE /achievements/:id` — delete an achievement. */
  destroy: async (id: string) => api.delete(`/achievements/${id}`),
};

export default achievementService;

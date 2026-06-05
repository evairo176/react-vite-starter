import type { AxiosProgressEvent } from "axios";
import api from "../api/axios";

const imageService = {
  findAll: async (params?: string) => api.get(`/image?${params}`),

  /**
   * Bulk upload images.
   * Backend route: POST /image (multer.fields, accepts 'icon_files' and 'portfolio_files')
   * Body shape (FormData):
   *   - portfolio_files[]: File (one or more)
   *   - imageUrls[]: string (remote URL upload)
   *   - folder?: string
   *   - tags[]?: string
   *   - name?: string
   */
  create: async (
    payload: FormData,
    onUploadProgress?: (e: AxiosProgressEvent) => void,
  ) =>
    api.post("/image", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    }),
};

export default imageService;

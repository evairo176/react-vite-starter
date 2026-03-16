import api from "../api/axios";
import type { SetRolePermissionDTO } from "../types/rolePermissions.type";

const rolePermissionService = {
  updateRolePermission: async (payload: SetRolePermissionDTO) =>
    api.post(`/role-permissions`, payload),
};

export default rolePermissionService;

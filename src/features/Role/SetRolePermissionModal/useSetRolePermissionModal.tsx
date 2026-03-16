import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";

import rolePermissionService from "@/core/services/rolePermission.service";
import type { SetRolePermissionDTO } from "@/core/types/rolePermissions.type";

const useSetRolePermissionModal = ({ close }: { close: () => void }) => {
  const saveToDatabase = async (payload: SetRolePermissionDTO) => {
    const res = await rolePermissionService.updateRolePermission(payload);
    return res;
  };

  const { mutate: mutateSave, isPending: isPendingSave } = useMutation({
    mutationFn: saveToDatabase,

    onSuccess: (response) => {
      const message = successCallback(response);
      toast.success(message);

      close();
    },

    onError: (error: any) => {
      const { message } = errorCallback(error);
      toast.error(message);
    },
  });

  /**
   * Transform UI state → backend payload
   */

  const handleSave = (payload: SetRolePermissionDTO) => {
    mutateSave(payload);
  };

  return {
    handleSave,
    isPendingSave,
  };
};

export default useSetRolePermissionModal;

import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import sessionService from "@/core/services/session.service";

const useRevokeModal = ({ id, close }: { id: string; close: () => void }) => {
  const RevokeToDatabase = async (id: string) => {
    const res = await sessionService.revokeSession(id);

    return res;
  };

  const {
    mutate: mutateSaveToDatabase,
    isPending: isPendingMutateSaveToDatabase,
    isSuccess: isSuccessMutateSaveToDatabase,
  } = useMutation({
    mutationFn: RevokeToDatabase,
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

  const handleSubmit = async () => {
    // panggil mutation dengan JSON payload
    mutateSaveToDatabase(id);
  };

  return {
    handleSubmit,

    isPendingMutateSaveToDatabase,
    isSuccessMutateSaveToDatabase,
  };
};

export default useRevokeModal;

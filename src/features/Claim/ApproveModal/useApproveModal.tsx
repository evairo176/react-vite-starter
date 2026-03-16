import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import claimService from "@/core/services/claim.service";
import type { IClaim } from "@/core/types/claim.type";

const useApproveModal = ({
  close,
  data,
}: {
  close: () => void;
  data: IClaim | null;
}) => {
  const UpdateDatabase = async () => {
    if (!data?.id) return;
    const res = await claimService.approve(data.id);
    return res;
  };

  const {
    mutate: mutateSaveToDatabase,
    isPending: isPendingMutateSaveToDatabase,
    isSuccess: isSuccessMutateSaveToDatabase,
  } = useMutation({
    mutationFn: UpdateDatabase,
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

  const handleApprove = async () => {
    mutateSaveToDatabase();
  };

  return {
    handleApprove,
    isPendingMutateSaveToDatabase,
    isSuccessMutateSaveToDatabase,
  };
};

export default useApproveModal;

import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import claimService from "@/core/services/claim.service";
import {
  rejectClaimSchema,
  type IClaim,
  type rejectClaimDTO,
} from "@/core/types/claim.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const useRejectModal = ({
  close,
  data,
}: {
  close: () => void;
  data: IClaim | null;
}) => {
  const form = useForm<rejectClaimDTO>({
    resolver: zodResolver(rejectClaimSchema),
    defaultValues: {
      note: "",
    },
    mode: "onSubmit",
  });

  const UpdateDatabase = async (payload: rejectClaimDTO) => {
    if (!data?.id) return;
    const res = await claimService.reject(data.id, payload.note);
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

  const handleSubmit = async (payload: rejectClaimDTO) => {
    mutateSaveToDatabase(payload);
  };

  return {
    form,
    handleSubmit,
    isPendingMutateSaveToDatabase,
    isSuccessMutateSaveToDatabase,
  };
};

export default useRejectModal;

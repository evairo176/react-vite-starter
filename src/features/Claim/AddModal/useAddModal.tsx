import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import claimService from "@/core/services/claim.service";
import {
  createClaimSchema,
  type createClaimDTO,
} from "@/core/types/claim.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const useAddModal = ({ close }: { close: () => void }) => {
  const form = useForm<createClaimDTO>({
    resolver: zodResolver(createClaimSchema),
    defaultValues: {
      name: "",
      desc: "",
    },
    mode: "onSubmit",
  });

  const AddToDatabase = async (payload: createClaimDTO) => {
    const res = await claimService.create(payload);
    return res;
  };

  const {
    mutate: mutateSaveToDatabase,
    isPending: isPendingMutateSaveToDatabase,
    isSuccess: isSuccessMutateSaveToDatabase,
  } = useMutation({
    mutationFn: AddToDatabase,
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

  const handleSubmit = async (payload: createClaimDTO) => {
    mutateSaveToDatabase(payload);
  };

  return {
    form,
    handleSubmit,
    isPendingMutateSaveToDatabase,
    isSuccessMutateSaveToDatabase,
  };
};

export default useAddModal;

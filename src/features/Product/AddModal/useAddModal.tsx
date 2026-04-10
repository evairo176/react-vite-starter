import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import productService from "@/core/services/product.service";
import {
  CreateProductSchema,
  type CreateProductDTO,
} from "@/core/types/product.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const useAddModal = ({ close }: { close: () => void }) => {
  const form = useForm<CreateProductDTO>({
    resolver: zodResolver(CreateProductSchema),

    mode: "onSubmit",
  });

  const AddToDatabase = async (payload: CreateProductDTO) => {
    const res = await productService.create(payload);
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

  const handleSubmit = async (payload: CreateProductDTO) => {
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

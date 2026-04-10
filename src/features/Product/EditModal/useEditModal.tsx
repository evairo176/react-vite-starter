import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import productService from "@/core/services/product.service";
import {
  UpdateProductSchema,
  type UpdateProductDTO,
  type IProduct,
} from "@/core/types/product.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

const useEditModal = ({
  close,
  data,
}: {
  close: () => void;
  data: IProduct | null;
}) => {
  const form = useForm<UpdateProductDTO>({
    resolver: zodResolver(UpdateProductSchema),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name,
        sku: data.sku,
        price: data.price,
        stock: data.stock,
      });
    }
  }, [data, form]);

  const UpdateDatabase = async (payload: UpdateProductDTO) => {
    if (!data?.id) return;
    const res = await productService.update(data.id, payload);
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

  const handleSubmit = async (payload: UpdateProductDTO) => {
    mutateSaveToDatabase(payload);
  };

  return {
    form,
    handleSubmit,
    isPendingMutateSaveToDatabase,
    isSuccessMutateSaveToDatabase,
  };
};

export default useEditModal;

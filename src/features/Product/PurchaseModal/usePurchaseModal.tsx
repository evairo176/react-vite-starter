import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import productService from "@/core/services/product.service";
import { type IProduct } from "@/core/types/product.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PurchaseSchema,
  type PurchaseDTO,
} from "@/core/types/transaction.type";
import { useEffect } from "react";

const usePurchaseModal = ({
  close,
  data,
}: {
  close: () => void;
  data: IProduct | null;
}) => {
  const form = useForm<PurchaseDTO>({
    resolver: zodResolver(PurchaseSchema),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (data) {
      form.reset({
        productId: data.id,
        qty: 1,
      });
    }
  }, [data, form]);
  const UpdateDatabase = async (payload: PurchaseDTO) => {
    if (!data?.id) return;
    const res = await productService.purchase(payload);
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

  const handleSubmit = async (payload: PurchaseDTO) => {
    mutateSaveToDatabase(payload);
  };

  return {
    form,
    handleSubmit,
    isPendingMutateSaveToDatabase,
    isSuccessMutateSaveToDatabase,
  };
};

export default usePurchaseModal;

import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import productService from "@/core/services/product.service";
import { type IProduct } from "@/core/types/product.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaleSchema, type SaleDTO } from "@/core/types/transaction.type";
import { useEffect } from "react";

const useSaleModal = ({
  close,
  data,
}: {
  close: () => void;
  data: IProduct | null;
}) => {
  const form = useForm<SaleDTO>({
    resolver: zodResolver(SaleSchema),
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
  const UpdateDatabase = async (payload: SaleDTO) => {
    if (!data?.id) return;
    const res = await productService.sale(payload);
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

  const handleSubmit = async (payload: SaleDTO) => {
    mutateSaveToDatabase(payload);
  };

  return {
    form,
    handleSubmit,
    isPendingMutateSaveToDatabase,
    isSuccessMutateSaveToDatabase,
  };
};

export default useSaleModal;

import { useMutation, useQuery } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import portfolioService from "@/core/services/portfolio.service";
import {
  CreatePortfolioSchema,
  type CreatePortfolioDTO,
} from "@/core/types/portfolio.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import categoryService from "@/core/services/category.service";
import tagService from "@/core/services/tag.service";
import techStackService from "@/core/services/techStack.service";

const useAddModal = ({ close }: { close: () => void }) => {
  const form = useForm<CreatePortfolioDTO>({
    resolver: zodResolver(CreatePortfolioSchema),
    defaultValues: {
      featured: false,
      isPublished: true,
      images: [],
      tagIds: [],
      techIds: [],
    },
    mode: "onSubmit",
  });

  const AddToDatabase = async (payload: CreatePortfolioDTO) => {
    const res = await portfolioService.create(payload);

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

  const handleSubmit = async (payload: CreatePortfolioDTO) => {
    mutateSaveToDatabase(payload);
  };

  const findAllCategory = async () => {
    let params = `limit=${1000}&page=${1}`;

    const res = await categoryService.findAll(`${params}`);

    const { data } = res;

    return data?.data;
  };

  const { data: dataCategory } = useQuery({
    queryKey: ["Category-form"],
    queryFn: findAllCategory,
  });

  const findAllTag = async () => {
    let params = `limit=${1000}&page=${1}`;

    const res = await tagService.findAll(`${params}`);

    const { data } = res;

    return data?.data;
  };

  const { data: dataTag } = useQuery({
    queryKey: ["tags-form"],
    queryFn: findAllTag,
  });

  const findAllTech = async () => {
    let params = `limit=${1000}&page=${1}`;

    const res = await techStackService.findAll(`${params}`);

    const { data } = res;

    return data?.data;
  };

  const { data: dataTech } = useQuery({
    queryKey: ["tech-form"],
    queryFn: findAllTech,
  });

  return {
    form,
    handleSubmit,

    isPendingMutateSaveToDatabase,
    isSuccessMutateSaveToDatabase,

    dataCategory,
    dataTag,
    dataTech,
  };
};

export default useAddModal;

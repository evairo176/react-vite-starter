import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import blogPostService from "@/core/services/blogPost.service";
import {
  CreateBlogPostSchema,
  type CreateBlogPostDTO,
} from "@/core/types/blogPost.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const useAddModal = ({ close }: { close: () => void }) => {
  const form = useForm<CreateBlogPostDTO>({
    resolver: zodResolver(CreateBlogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      isPublished: false,
    },
    mode: "onSubmit",
  });

  const addToDatabase = async (payload: CreateBlogPostDTO) => {
    const res = await blogPostService.create(payload);
    return res;
  };

  const { mutate: mutateSaveToDatabase, isPending: isPendingMutateSaveToDatabase } =
    useMutation({
      mutationFn: addToDatabase,
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

  const handleSubmit = async (payload: CreateBlogPostDTO) => {
    mutateSaveToDatabase(payload);
  };

  return {
    form,
    handleSubmit,
    isPendingMutateSaveToDatabase,
  };
};

export default useAddModal;

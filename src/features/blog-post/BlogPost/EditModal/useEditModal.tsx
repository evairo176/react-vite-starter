import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";
import blogPostService from "@/core/services/blogPost.service";
import {
  UpdateBlogPostSchema,
  type UpdateBlogPostDTO,
  type IBlogPost,
} from "@/core/types/blogPost.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

const useEditModal = ({
  close,
  data,
}: {
  close: () => void;
  data: IBlogPost | null;
}) => {
  const form = useForm<UpdateBlogPostDTO>({
    resolver: zodResolver(UpdateBlogPostSchema),
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

  useEffect(() => {
    if (data) {
      form.reset({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? "",
        content: data.content ?? "",
        coverImage: data.coverImage ?? "",
        isPublished: data.isPublished,
      });
    }
  }, [data, form]);

  const updateDatabase = async (payload: UpdateBlogPostDTO) => {
    if (!data?.id) return;
    const res = await blogPostService.update(data.id, payload);
    return res;
  };

  const { mutate: mutateSaveToDatabase, isPending: isPendingMutateSaveToDatabase } =
    useMutation({
      mutationFn: updateDatabase,
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

  const handleSubmit = async (payload: UpdateBlogPostDTO) => {
    mutateSaveToDatabase(payload);
  };

  return {
    form,
    handleSubmit,
    isPendingMutateSaveToDatabase,
  };
};

export default useEditModal;

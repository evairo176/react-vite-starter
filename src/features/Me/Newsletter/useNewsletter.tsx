import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import newsletterService from "@/core/services/newsletter.service";
import {
  NewsletterSchema,
  type NewsletterDTO,
  type NewsletterPayload,
} from "@/core/types/newsletter.type";
import { successCallback, errorCallback } from "@/core/utils/tanstack-callback";

/**
 * Data orchestration for the Newsletter_Form (Req 6).
 *
 * Wires a react-hook-form instance validated by the zod `NewsletterSchema` to a
 * TanStack `useMutation` over `newsletterService.subscribe`. Invalid emails are
 * blocked by field validation (Req 6.2). On success the email input is cleared
 * and a success toast is shown (Req 6.4); on failure an error toast is shown
 * (Req 6.5). `justSucceeded` is exposed so the component can play a confirmation
 * animation (Req 21.3).
 */
const useNewsletter = () => {
  const form = useForm<NewsletterDTO>({
    resolver: zodResolver(NewsletterSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });

  const {
    mutate,
    isPending,
    isSuccess: justSucceeded,
  } = useMutation({
    mutationFn: (payload: NewsletterPayload) =>
      newsletterService.subscribe(payload),
    onSuccess: (response) => {
      const message = successCallback(response);
      toast.success(message);
      // Clear the email input on success. (Req 6.4)
      form.reset();
    },
    onError: (error: any) => {
      const { message } = errorCallback(error);
      toast.error(message);
    },
  });

  const handleSubmit = (values: NewsletterDTO) => {
    mutate(values);
  };

  return {
    form,
    handleSubmit,
    isPending,
    justSucceeded,
  };
};

export default useNewsletter;

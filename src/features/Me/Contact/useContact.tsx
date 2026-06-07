import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import contactService from "@/core/services/contact.service";
import {
  ContactSchema,
  type ContactDTO,
  type ContactPayload,
} from "@/core/types/contact.type";
import { successCallback, errorCallback } from "@/core/utils/tanstack-callback";

/**
 * Data orchestration for the Contact_Form (Req 5).
 *
 * Wires a react-hook-form instance validated by the zod `ContactSchema` to a
 * TanStack `useMutation` over `contactService.submit`. Field-level validation
 * blocks submission until every field is valid (Req 5.2). On success the form
 * is fully reset and a success toast is shown (Req 5.5); on failure an error
 * toast is shown and the entered values are preserved (Req 5.6). The component
 * reads `isPending` to drive the submit Loading_State (Req 5.4) and `justSucceeded`
 * is exposed so the component can play a confirmation animation (Req 21.3).
 */
const useContact = () => {
  const form = useForm<ContactDTO>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      body: "",
    },
    mode: "onSubmit",
  });

  const {
    mutate,
    isPending,
    isSuccess: justSucceeded,
  } = useMutation({
    mutationFn: (payload: ContactPayload) => contactService.submit(payload),
    onSuccess: (response) => {
      const message = successCallback(response);
      toast.success(message);
      // Clear all input fields completely on success. (Req 5.5)
      form.reset();
    },
    onError: (error: any) => {
      const { message } = errorCallback(error);
      // Show an error toast; entered values stay intact because we do not
      // reset the form on failure. (Req 5.6)
      toast.error(message);
    },
  });

  const handleSubmit = (values: ContactDTO) => {
    mutate(values);
  };

  return {
    form,
    handleSubmit,
    isPending,
    justSucceeded,
  };
};

export default useContact;

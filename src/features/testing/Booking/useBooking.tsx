import { useMutation } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";

import bookingService from "@/core/services/booking.service";

import {
  CreateBookingSchema,
  type CreateBookingDTO,
} from "@/core/types/booking.type";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const useBooking = ({ close }: { close?: () => void }) => {
  const form = useForm<CreateBookingDTO>({
    resolver: zodResolver(CreateBookingSchema),
    defaultValues: {
      name: "",
      title: "",
      description: "",
      requestType: "SOFTWARE",
      doxaReason: [],
      date: "",
      startTime: "",
      endTime: "",
    },
    mode: "onSubmit",
  });

  const createBooking = async (payload: CreateBookingDTO) => {
    const res = await bookingService.createBooking(payload);
    return res;
  };

  const { mutate: mutateCreateBooking, isPending: isPendingCreateBooking } =
    useMutation({
      mutationFn: createBooking,

      onSuccess: (response) => {
        const message = successCallback(response);
        toast.success(message);

        form.reset();

        if (close) close();
      },

      onError: (error: any) => {
        const { message } = errorCallback(error);
        toast.error(message);
      },
    });

  const handleSubmit = (payload: CreateBookingDTO) => {
    mutateCreateBooking(payload);
  };

  return {
    form,
    handleSubmit,
    isPendingCreateBooking,
  };
};

export default useBooking;

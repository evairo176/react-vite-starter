import { useMutation, useQuery } from "@tanstack/react-query";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import { toast } from "sonner";

import ticketService from "@/core/services/ticket.service";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  AssignTicketSchema,
  type AssignTicketDTO,
} from "@/core/types/ticket.type";

const useAssignTicket = ({
  ticketId,
  close,
  onSuccess,
}: {
  ticketId: string;
  close?: () => void;
  onSuccess?: () => void;
}) => {
  // =========================
  // FORM
  // =========================

  const form = useForm<AssignTicketDTO>({
    resolver: zodResolver(AssignTicketSchema),
    defaultValues: {
      picId: "",
    },
    mode: "onSubmit",
  });

  // =========================
  // GET PIC IT
  // =========================

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users-pic-it"],
    queryFn: ticketService.getPic,
  });

  // =========================
  // MUTATION
  // =========================

  const assignTicket = async (payload: AssignTicketDTO) => {
    const res = await ticketService.assign(ticketId, payload.picId);
    return res;
  };

  const { mutate: mutateAssignTicket, isPending: isPendingAssignTicket } =
    useMutation({
      mutationFn: assignTicket,

      onSuccess: (response) => {
        const message = successCallback(response);
        toast.success(message);

        form.reset();

        if (close) close();
        if (onSuccess) onSuccess();
      },

      onError: (error: any) => {
        const { message } = errorCallback(error);
        toast.error(message);
      },
    });

  const handleSubmit = (payload: AssignTicketDTO) => {
    mutateAssignTicket(payload);
  };

  return {
    form,
    users,
    isLoadingUsers,
    handleSubmit,
    isPendingAssignTicket,
  };
};

export default useAssignTicket;

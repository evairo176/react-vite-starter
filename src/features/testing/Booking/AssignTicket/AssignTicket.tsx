import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import useAssignTicket from "./useAssignTicket";

type Props = {
  ticketId: string;
  onAssigned?: () => void;
};

const AssignPicDialog = ({ ticketId, onAssigned }: Props) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSuccess = () => {
    if (onAssigned) onAssigned();
  };

  const { form, users, handleSubmit, isPendingAssignTicket } = useAssignTicket({
    ticketId,
    close: handleClose,
    onSuccess: handleSuccess,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Assign PIC</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign PIC IT</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="picId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih PIC IT</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih PIC IT" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {users?.data?.length > 0 &&
                        users?.data?.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isPendingAssignTicket}
            >
              {isPendingAssignTicket ? "Assigning..." : "Assign Ticket"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignPicDialog;

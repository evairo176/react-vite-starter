import usePurchaseModal from "./usePurchaseModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, Type, Link, Package } from "lucide-react";

interface PurchaseModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any | null;
  refetch: () => void;
}

export default function PurchaseModal({
  open,
  setOpen,
  data,
  refetch,
}: PurchaseModalProps) {
  const { form, handleSubmit, isPendingMutateSaveToDatabase } =
    usePurchaseModal({
      close: () => {
        setOpen(false);
        refetch();
      },
      data,
    });

  const formId = "purchaseProductModal";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>Purchase Product</DialogTitle>
          <DialogDescription>Update product details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id={formId}
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            {/* QUANTITY */}

            <FormField
              control={form.control}
              name="qty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Package className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

                      <Input
                        {...field}
                        type="number"
                        placeholder="e.g. 5"
                        className="pl-9"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button" className="gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
          </DialogClose>
          <Button
            form={formId}
            type="submit"
            disabled={isPendingMutateSaveToDatabase}
            className="gap-2"
          >
            {isPendingMutateSaveToDatabase ? "Saving..." : "Purchase"}
            {!isPendingMutateSaveToDatabase && <Save className="w-4 h-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import useEditModal from "./useEditModal";
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
import { Save, X, Type, Link } from "lucide-react";

interface EditModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any | null;
  refetch: () => void;
}

export default function EditModal({
  open,
  setOpen,
  data,
  refetch,
}: EditModalProps) {
  const { form, handleSubmit, isPendingMutateSaveToDatabase } = useEditModal({
    close: () => {
      setOpen(false);
      refetch();
    },
    data,
  });

  const formId = "editProductModal";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id={formId}
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            {/* PRODUCT NAME */}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Type className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="e.g. Laptop Lenovo"
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SKU */}

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Link className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="LTP-001"
                        className="pl-9 font-mono text-sm"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PRICE */}

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="15000000"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* STOCK */}

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="10"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
            {isPendingMutateSaveToDatabase ? "Saving..." : "Update Product"}
            {!isPendingMutateSaveToDatabase && <Save className="w-4 h-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import useSubmitModal from "./useSubmitModal";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { IClaim } from "@/core/types/claim.type";
import { Save, X, Type, Link } from "lucide-react";

interface SubmitModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: IClaim;
  refetch: () => void;
}

export default function SubmitModal({
  open,
  setOpen,
  data,
  refetch,
}: SubmitModalProps) {
  const { handleSubmit, isPendingMutateSaveToDatabase } = useSubmitModal({
    close: () => {
      setOpen(false);
      refetch();
    },
    data,
  });

  const formId = "submitClaimModal";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>Submit Claim</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Name</Label>
          <div className="relative">
            <Type className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="e.g. Web Development"
              className="pl-9"
              defaultValue={data.name}
              disabled
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <div className="relative">
            <Link className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Textarea
              defaultValue={data.desc}
              placeholder="lorem j"
              className="pl-9 font-mono text-sm"
              disabled
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button" className="gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={isPendingMutateSaveToDatabase}
            className="gap-2"
          >
            {isPendingMutateSaveToDatabase ? "Saving..." : "Submit Claim"}
            {!isPendingMutateSaveToDatabase && <Save className="w-4 h-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

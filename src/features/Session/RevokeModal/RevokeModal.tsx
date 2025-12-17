import useRevokeModal from "./useRevokeModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UserAgentCell from "@/components/shared/user-agent-cell";

type RevokeModalModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any | null;
  refetch: () => void;
};

export default function RevokeModal({
  open,
  setOpen,
  data,
  refetch,
}: RevokeModalModalProps) {
  const {
    handleSubmit,

    isPendingMutateSaveToDatabase,
    // isSuccessMutateSaveToDatabase
  } = useRevokeModal({
    id: data?.id,
    close: () => {
      setOpen(false);
      refetch();
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      // onOpenChange={(value: boolean) => {
      //   setOpen(value);

      //   if (value === false) {
      //     refetch();
      //   }
      // }}
    >
      <DialogContent className={"w-full overflow-y-scroll max-h-screen"}>
        <DialogHeader>
          <DialogTitle>Revoke Session {data?.id}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <UserAgentCell modal={true} value={data?.userAgent} />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant={"destructive"}
              className="cursor-pointer"
            >
              Close
            </Button>
          </DialogClose>
          <Button
            form="group-form"
            onClick={handleSubmit}
            variant="default"
            disabled={isPendingMutateSaveToDatabase}
            className="cursor-pointer"
          >
            {isPendingMutateSaveToDatabase ? "Menyimpan..." : "Revoke"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { IClaim } from "@/core/types/claim.type";
import { formatDate } from "@/core/utils/date";

import { X, Type, Link } from "lucide-react";

interface DetailModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: IClaim;
  refetch: () => void;
}

export default function DetailModal({ open, setOpen, data }: DetailModalProps) {
  const groupedLogs = Object.values(
    data.logs.reduce((acc: any, log) => {
      if (!acc[log.toStatus]) {
        acc[log.toStatus] = {
          status: log.toStatus,
          logs: [],
        };
      }

      acc[log.toStatus].logs.push(log);

      return acc;
    }, {}),
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-full sm:max-w-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>Detail Claim</DialogTitle>
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

        <div className="flex flex-row items-center justify-center">
          <div className="flex items-start overflow-x-auto pb-4">
            {groupedLogs.map((group: any, index) => {
              const isLast = index === groupedLogs.length - 1;

              const statusColor: Record<string, string> = {
                DRAFT: "bg-gray-400",
                SUBMITTED: "bg-blue-500",
                REVIEWED: "bg-yellow-500",
                APPROVED: "bg-green-500",
                REJECTED: "bg-red-500",
              };

              return (
                <div key={group.status} className="flex items-start">
                  <div className="flex flex-col items-center min-w-[160px] text-center">
                    {/* Circle */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${statusColor[group.status]}`}
                    >
                      {index + 1}
                    </div>

                    {/* Status */}
                    <div className="font-semibold mt-2">{group.status}</div>

                    {/* Detail logs */}
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {group?.logs?.map((log: any) => (
                        <div key={log.id} className="text-left">
                          <div>
                            {log.actor.name} • {formatDate(log.createdAt)}
                          </div>

                          {log.note && (
                            <div className="text-red-500 text-[11px] italic">
                              Note: {log.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {!isLast && (
                    <div className="h-[2px] w-24 bg-border mt-6 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button" className="gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

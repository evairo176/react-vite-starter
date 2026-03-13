import { Pencil, Plus, Trash } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/table/data-table-column-header";
import { fmtDate, formatDate } from "@/core/utils/date";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared/table/data-table";
import useTicket from "./useTicket";
import AssignTicket from "../AssignTicket";
import ticketService from "@/core/services/ticket.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
// import type { IPTicket } from "@/core/types/Ticket.type";
// import AddModal from "./AddModal/AddModal";
// import EditModal from "./EditModal/EditModal";

const Ticket = () => {
  const { dataTicket, isLoadingTicket, refetchTicket } = useTicket();

  //   const [addModal, setAddModal] = useState(false);
  //   const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [loadingFinish, setLoadingFinish] = useState<string | null>(null);

  const handleFinishTask = async (ticketId: string) => {
    setLoadingFinish(ticketId);
    try {
      await ticketService.finish(ticketId);
      toast.success("Task finished successfully");
      refetchTicket();
    } catch (error: any) {
      toast.error(error?.message || "Failed to finish task");
    } finally {
      setLoadingFinish(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "duration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration - finish at" />
      ),
      cell: ({ row }) => {
        const table: any = row.original;
        return (
          <div className="text-left font-medium">
            {table.durationMin ?? 0} mins -{" "}
            {table.finishedAt ? formatDate(table.finishedAt) : "Not finished"}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "requestType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Request Type" />
      ),
      cell: ({ row }) => {
        const table: any = row.original;
        return (
          <div className="flex flex-col  w-[200px]">
            <div className="text-left font-medium">{table.requestType}</div>
            {table.requestType === "DOXA_REVISION" && (
              <div className="flex flex-row flex-wrap">
                {table.doxaReason?.map((reason: string, index: number) => (
                  <Badge key={index} variant="outline" className="mr-1">
                    {reason}
                  </Badge>
                )) || <Badge variant="outline">No reason</Badge>}
              </div>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const table: any = row.original;
        return (
          <div>
            <div className="text-left  font-bold">{table.title}</div>
            <p className="text-sm font-light">{table.description}</p>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created Date" />
      ),
      cell: ({ row }) => {
        const table: any = row.original;
        return (
          <div className="text-left text-sm font-medium">
            {fmtDate(table.createdAt)}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PIC" />
      ),
      id: "pic",
      enableHiding: false,
      cell: ({ row }) => {
        const table = row.original;

        if (table.pic) {
          return (
            <div>
              <div className="text-left text-sm mb-2">{table.pic.name}</div>
              {table?.status === "IN_PROGRESS" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFinishTask(table.id)}
                  disabled={loadingFinish !== null}
                >
                  {loadingFinish === table.id ? "Finishing..." : "Finish Task"}
                </Button>
              )}
            </div>
          );
        }
        return <AssignTicket ticketId={table.id} onAssigned={refetchTicket} />;
      },
    },
    {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="STATUS" />
      ),
      id: "Status",
      enableHiding: false,
      cell: ({ row }) => {
        const table = row.original;
        if (table.status === "IN_PROGRESS") {
          return (
            <Badge variant="secondary">{table.status?.replace("_", " ")}</Badge>
          );
        } else if (table.status === "OPEN") {
          return <Badge variant="outline">{table.status}</Badge>;
        } else if (table.status === "FINISHED") {
          return (
            <Badge variant="default">{table.status?.replace("_", " ")}</Badge>
          );
        }
        return <Badge>{table.status}</Badge>;
      },
    },
    // {
    //   id: "actions",
    //   enableHiding: false,
    //   cell: ({ row }) => {
    //     const table = row.original;

    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" className="h-8 w-8 p-0">
    //             <span className="sr-only">Open menu</span>
    //             <MoreHorizontal />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end">
    //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //           <DropdownMenuItem
    //             onClick={() => {
    //               const data =
    //                 dataTicket?.data?.find(
    //                   (row: IPTicket) => row.id === table.id
    //                 ) || null;
    //               setSelected(data);
    //               setEditModal(true);
    //             }}
    //           >
    //             <Pencil className="w-4 h-4 mr-2" />
    //             Edit
    //           </DropdownMenuItem>
    //           <DropdownMenuItem
    //             onClick={() => {
    //               // TODO: Implement delete
    //             }}
    //           >
    //             <Trash className="w-4 h-4 mr-2 text-red-500" />
    //             Delete
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    // },
  ];

  return (
    <div className="md:p-6 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Ticket management</h1>
          <p className="text-muted-foreground">Manage and review Ticket data</p>
        </div>
        {/* <Button onClick={() => setAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Ticket
        </Button> */}
      </div>

      <div className="w-full grid gap-2 relative overflow-x-hidden">
        <Card className="mt-3">
          <CardContent>
            <DataTable
              totalPages={dataTicket?.metadata?.totalPages}
              totalData={dataTicket?.metadata?.total}
              columns={columns}
              data={dataTicket?.data || []}
              isLoading={isLoadingTicket}
              refetch={refetchTicket}
              excelName="Ticket"
            />
          </CardContent>
        </Card>
      </div>

      {/* <AddModal
        open={addModal}
        setOpen={setAddModal}
        refetch={refetchTicket}
      />
      <EditModal
        open={editModal}
        setOpen={setEditModal}
        data={selected}
        refetch={refetchTicket}
      /> */}
    </div>
  );
};

export default Ticket;

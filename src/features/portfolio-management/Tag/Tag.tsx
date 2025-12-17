import { Loader, MoreVertical, Plus, Trash } from "lucide-react";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/table/data-table-column-header";
import { fmtDate } from "@/core/utils/date";
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
import UserAgentCell from "@/components/shared/user-agent-cell";
import ExpiredAtCell from "@/components/shared/expired-at-cell";
import IsCurrentCell from "@/components/shared/is-current-cell";
import IsRevokedCell from "@/components/shared/is-revoke-cell";
import useTag from "./useTag";
import type { IPTag } from "@/core/types/tag.type";

const Tag = () => {
  const {
    dataTag,
    isLoadingTag,
    isRefetchingTag,
    refetchTag,

    selected,
    setSelected,
  } = useTag();

  const columns: ColumnDef<IPTag>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Id" />
      ),
      cell: ({ row }) => {
        const table = row.original;

        return <div className="text-left font-medium">{table.id}</div>;
      },
      accessorFn: (row) => row.id, // fallback
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const table: any = row.original;

        return <div className="text-left font-medium">{table.name}</div>;
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => {
        const table: any = row.original;

        return <div className="text-left font-medium">{table.slug}</div>;
      },
      enableSorting: false,
      enableHiding: true,
    },

    //   id: "actions",
    //   enableHiding: false,

    //   cell: ({ row }) => {
    //     const table = row.original;

    //     if (table.isCurrent || table.isRevoke) {
    //       return (
    //         <DropdownMenu>
    //           <DropdownMenuTrigger asChild>
    //             <Button variant="ghost" className="h-8 w-8 p-0">
    //               <span className="sr-only">Open menu</span>
    //               <MoreHorizontal />
    //             </Button>
    //           </DropdownMenuTrigger>
    //           <DropdownMenuContent align="end">
    //             <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //           </DropdownMenuContent>
    //         </DropdownMenu>
    //       );
    //     }

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
    //                 dataTag?.data?.find(
    //                   (row: IPTag) => row.id === table.id
    //                 ) || null;
    //               setSelected(data);
    //               setRevokeModal(true);
    //             }}
    //           >
    //             <Trash className="text-red-500" /> Revoke Tag
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    // },
  ];

  return (
    <div className="md:p-6 p-4">
      <h1 className="text-2xl font-bold">Tag management</h1>
      <p>Manage and review Tag data for companies within the system</p>
      <div className="w-full grid gap-2 relative overflow-x-hidden">
        <Card className="mt-3">
          <CardContent>
            <DataTable
              totalPages={dataTag?.metadata?.totalPages}
              totalData={dataTag?.metadata?.total}
              columns={columns}
              data={dataTag?.data || []}
              isLoading={isLoadingTag}
              refetch={refetchTag}
              excelName="Tag"
            />
          </CardContent>
        </Card>
      </div>
      {/* <RevokeModal
        open={revokeModal}
        setOpen={setRevokeModal}
        data={selected}
        refetch={refetchTag}
      /> */}
    </div>
  );
};

export default Tag;

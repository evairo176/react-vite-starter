import { Loader, MoreVertical, Plus, Trash } from "lucide-react";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import useSession from "./useSession";
import type { IPSession } from "@/core/types/session.type";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/shared/table/data-table-column-header";
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
import { DataTable } from "@/shared/table/data-table";
import LoaderAnimation from "@/shared/loader-animation";
import UserAgentCell from "@/shared/user-agent-cell";
import ExpiredAtCell from "@/shared/expired-at-cell";
import IsCurrentCell from "@/shared/is-current-cell";
import IsRevokedCell from "@/shared/is-revoke-cell";
import RevokeModal from "./RevokeModal";

const Session = () => {
  const {
    dataSession,
    isLoadingSession,
    isRefetchingSession,
    refetchSession,

    selected,
    setSelected,
  } = useSession();

  const [revokeModal, setRevokeModal] = useState(false);

  const columns: ColumnDef<IPSession>[] = [
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
      accessorKey: "userAgent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Browser" />
      ),
      cell: ({ row }) => {
        const table: any = row.original;

        return <UserAgentCell value={table?.userAgent} />;
      },
      enableSorting: false,
      enableHiding: true,
    },

    {
      accessorKey: "isCurrent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Current" />
      ),
      cell: ({ row }) => {
        const data: any = row.original;
        return <IsCurrentCell value={data?.isCurrent} />;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "isRevoke",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Revoked" />
      ),
      cell: ({ row }) => {
        const data: any = row.original;
        return <IsRevokedCell value={data?.isRevoke} />;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "expiredAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expired At" />
      ),
      cell: ({ row }) => {
        const data = row.original;
        return <ExpiredAtCell value={data.expiredAt} />;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Create Date" />
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
      id: "actions",
      enableHiding: false,

      cell: ({ row }) => {
        const table = row.original;

        if (table.isCurrent || table.isRevoke) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  const data =
                    dataSession?.data?.find(
                      (row: IPSession) => row.id === table.id
                    ) || null;
                  setSelected(data);
                  setRevokeModal(true);
                }}
              >
                <Trash className="text-red-500" /> Revoke Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="md:p-6 p-4">
      <h1 className="text-2xl font-bold">Session management</h1>
      <p>Manage and review Session data for companies within the system</p>
      <div className="w-full grid gap-2 relative overflow-x-hidden">
        <Card className="mt-3">
          <CardContent>
            <DataTable
              totalPages={dataSession?.metadata?.totalPages}
              totalData={dataSession?.metadata?.total}
              columns={columns}
              data={dataSession?.data || []}
              isLoading={isLoadingSession}
              refetch={refetchSession}
              excelName="Session"
            />
          </CardContent>
        </Card>
      </div>
      <RevokeModal
        open={revokeModal}
        setOpen={setRevokeModal}
        data={selected}
        refetch={refetchSession}
      />
    </div>
  );
};

export default Session;

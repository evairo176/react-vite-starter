import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/table/data-table-column-header";

import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared/table/data-table";
import useRole from "./useRole";
import SetRolePermission from "./SetRolePermissionModal/SetRolePermissionModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Book, MoreHorizontal, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Role = () => {
  const { dataRole, isLoadingRole, refetchRole, dataMenu } = useRole();
  const [rolePermissionModal, setRolePermissionModal] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "duration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => {
        const table: any = row.original;
        return <div className="text-left font-medium">{table.code}</div>;
      },
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
      accessorKey: "menu",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Menu" />
      ),
      cell: ({ row }) => {
        const table: any = row.original;
        return (
          <div className="w-[200px] flex flex-row flex-wrap">
            {table?.rolePermissions?.length > 0 ? (
              table?.rolePermissions?.map((row: any) => {
                return <Badge variant="outline">{row?.menuCode}</Badge>;
              })
            ) : (
              <Badge variant="outline">No Permission</Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const table = row.original;

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
                    dataRole?.data?.find(
                      (row: any) => row.code === table.code,
                    ) || null;
                  setSelected(data);
                  setRolePermissionModal(true);
                }}
              >
                <Book className="w-4 h-4 mr-2" />
                Set Permission
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="md:p-6 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Role management</h1>
          <p className="text-muted-foreground">Manage and review Role data</p>
        </div>
        {/* <Button onClick={() => setAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </Button> */}
      </div>

      <div className="w-full grid gap-2 relative overflow-x-hidden">
        <Card className="mt-3">
          <CardContent>
            <DataTable
              totalPages={dataRole?.metadata?.totalPages}
              totalData={dataRole?.metadata?.total}
              columns={columns}
              data={dataRole?.data || []}
              isLoading={isLoadingRole}
              refetch={refetchRole}
              excelName="Role"
            />
          </CardContent>
        </Card>
      </div>
      {selected && (
        <SetRolePermission
          open={rolePermissionModal}
          setOpen={setRolePermissionModal}
          refetch={refetchRole}
          selected={{
            ...selected,
            dataMenu: dataMenu?.data,
          }}
        />
      )}
    </div>
  );
};

export default Role;

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/shared/table/data-table-column-header";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/shared/table/data-table";
import useTechStack from "./useTechStack";
import type { IPTechStack } from "@/core/types/techStack.type";

const TechStack = () => {
  const {
    dataTechStack,
    isLoadingTechStack,

    refetchTechStack,
  } = useTechStack();

  const columns: ColumnDef<IPTechStack>[] = [
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
      accessorKey: "icon",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Icon" />
      ),
      cell: ({ row }) => {
        const table: any = row.original;

        return <div className="text-left font-medium">{table.icon}</div>;
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
    //                 dataTechStack?.data?.find(
    //                   (row: IPTechStack) => row.id === table.id
    //                 ) || null;
    //               setSelected(data);
    //               setRevokeModal(true);
    //             }}
    //           >
    //             <Trash className="text-red-500" /> Revoke TechStack
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    // },
  ];

  return (
    <div className="md:p-6 p-4">
      <h1 className="text-2xl font-bold">TechStack management</h1>
      <p>Manage and review TechStack data for companies within the system</p>
      <div className="w-full grid gap-2 relative overflow-x-hidden">
        <Card className="mt-3">
          <CardContent>
            <DataTable
              totalPages={dataTechStack?.metadata?.totalPages}
              totalData={dataTechStack?.metadata?.total}
              columns={columns}
              data={dataTechStack?.data || []}
              isLoading={isLoadingTechStack}
              refetch={refetchTechStack}
              excelName="TechStack"
            />
          </CardContent>
        </Card>
      </div>
      {/* <RevokeModal
        open={revokeModal}
        setOpen={setRevokeModal}
        data={selected}
        refetch={refetchTechStack}
      /> */}
    </div>
  );
};

export default TechStack;

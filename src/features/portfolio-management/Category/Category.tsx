import { Pencil, Plus, Trash } from "lucide-react";
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
import useCategory from "./useCategory";
import type { IPCategory } from "@/core/types/category.type";
import AddModal from "./AddModal/AddModal";
import EditModal from "./EditModal/EditModal";

const Category = () => {
  const { dataCategory, isLoadingCategory, refetchCategory } = useCategory();

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState<IPCategory | null>(null);

  const columns: ColumnDef<IPCategory>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Id" />
      ),
      cell: ({ row }) => {
        const table = row.original;
        return <div className="text-left font-medium">{table.id}</div>;
      },
      accessorFn: (row) => row.id,
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
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Update Date" />
      ),
      cell: ({ row }) => {
        const table: any = row.original;
        return (
          <div className="text-left text-sm font-medium">
            {fmtDate(table.updatedAt)}
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
                    dataCategory?.data?.find(
                      (row: IPCategory) => row.id === table.id
                    ) || null;
                  setSelected(data);
                  setEditModal(true);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Implement delete
                }}
              >
                <Trash className="w-4 h-4 mr-2 text-red-500" />
                Delete
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
          <h1 className="text-2xl font-bold">Category management</h1>
          <p className="text-muted-foreground">
            Manage and review Category data
          </p>
        </div>
        <Button onClick={() => setAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="w-full grid gap-2 relative overflow-x-hidden">
        <Card className="mt-3">
          <CardContent>
            <DataTable
              totalPages={dataCategory?.metadata?.totalPages}
              totalData={dataCategory?.metadata?.total}
              columns={columns}
              data={dataCategory?.data || []}
              isLoading={isLoadingCategory}
              refetch={refetchCategory}
              excelName="Category"
            />
          </CardContent>
        </Card>
      </div>

      <AddModal
        open={addModal}
        setOpen={setAddModal}
        refetch={refetchCategory}
      />
      <EditModal
        open={editModal}
        setOpen={setEditModal}
        data={selected}
        refetch={refetchCategory}
      />
    </div>
  );
};

export default Category;

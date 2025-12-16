import { Eye, Loader, MoreVertical, Plus, Trash } from "lucide-react";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

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

import usePortfolio from "./usePortfolio";
import type { IPPortfolio } from "@/core/types/portfolio.type";
import AddModal from "./AddModal";
import DetailModal from "./DetailModal";
import EditModal from "./EditModal/EditModal";
import { TagsInput } from "@/shared/tag-input";
import SEO from "@/components/shared/SEO";

const Portfolio = () => {
  const {
    dataPortfolio,
    isLoadingPortfolio,
    isRefetchingPortfolio,
    refetchPortfolio,

    selected,
    setSelected,
  } = usePortfolio();

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [id, setId] = useState<string>("");

  const columns: ColumnDef<IPPortfolio>[] = [
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
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const table = row.original;

        return <div className="text-left font-medium">{table.title}</div>;
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
        const table = row.original;

        return <div className="text-left font-medium">{table.slug}</div>;
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        const table = row.original;

        return (
          <div className="text-left font-medium">{table.category.name}</div>
        );
      },
      enableSorting: false,
      enableHiding: true,
      accessorFn: (row) => row.category.name, // fallback
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Update Date" />
      ),
      cell: ({ row }) => {
        const table = row.original;

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
                    dataPortfolio?.data?.find(
                      (row: IPPortfolio) => row.id === table.id
                    ) || null;
                  setSelected(data);
                  // setRevokeModal(true);
                }}
              >
                <Trash className="text-red-500" /> Revoke Portfolio
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const data =
                    dataPortfolio?.data?.find(
                      (row: IPPortfolio) => row.id === table.id
                    ) || null;
                  setSelected(data);
                  setEditModal(true);
                }}
              >
                <Eye className="text-amber-500" /> Edit Portfolio
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const data =
                    dataPortfolio?.data?.find(
                      (row: IPPortfolio) => row.id === table.id
                    ) || null;
                  setId(data?.id as string);
                  setDetailModal(true);
                }}
              >
                <Eye className="text-blue-500" /> Detail Portfolio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="md:p-6 p-4">
      <SEO title="Portfolio" description="Manage and review Portfolio data for companies within the system" />
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Portfolio management</h1>
          <p>
            Manage and review Portfolio data for companies within the system
          </p>
        </div>

        <Button
          onClick={() => {
            setAddModal(true);
          }}
        >
          {" "}
          <Plus className="w-4 h-4 mr-2" />
          Tambah Portfolio
        </Button>
      </div>

      <div className="w-full grid gap-2 relative overflow-x-hidden">
        <Card className="mt-3">
          <CardContent>
            <DataTable
              totalPages={dataPortfolio?.metadata?.totalPages}
              totalData={dataPortfolio?.metadata?.total}
              columns={columns}
              data={dataPortfolio?.data || []}
              isLoading={isLoadingPortfolio || isRefetchingPortfolio}
              refetch={refetchPortfolio}
              excelName="Portfolio"
            />
          </CardContent>
        </Card>
      </div>
      <AddModal
        open={addModal}
        setOpen={setAddModal}
        data={selected}
        refetch={refetchPortfolio}
      />
      {id && (
        <DetailModal open={detailModal} setOpen={setDetailModal} id={id} />
      )}
      <EditModal
        open={editModal}
        setOpen={setEditModal}
        data={selected}
        refetch={refetchPortfolio}
      />
    </div>
  );
};

export default Portfolio;

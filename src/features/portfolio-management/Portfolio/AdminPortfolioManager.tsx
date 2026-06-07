import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/table/data-table";
import { DataTableColumnHeader } from "@/components/shared/table/data-table-column-header";
import TableSkeleton from "@/components/shared/skeletons/TableSkeleton";
import SEO from "@/components/shared/SEO";
import { fmtDate } from "@/core/utils/date";
import type { IPPortfolio } from "@/core/types/portfolio.type";

import usePortfolioManager from "./usePortfolioManager";
import PortfolioFormDialog, {
  type PortfolioFormValues,
} from "./PortfolioFormDialog";

/**
 * Admin_Portfolio_Manager (Req 11, 16.5).
 *
 * Renders the project list in a react-table data table (TableSkeleton while
 * loading, Req 16.5), a create/edit dialog with the case-study fields
 * (Req 11.7), GalleryEditor (Req 11.8) and tech-stack multi-assignment
 * (Req 11.9), a delete confirmation dialog (Req 11.4), and a publish toggle
 * (Req 11.5-11.6). Field validation blocks submit (Req 11.10) and errors
 * surface as toasts while the view state is preserved (Req 11.11).
 */
const AdminPortfolioManager = () => {
  const {
    dataPortfolio,
    isLoadingPortfolio,
    isRefetchingPortfolio,
    refetchPortfolio,

    selected,
    setSelected,

    createPortfolio,
    isCreating,
    updatePortfolio,
    isUpdating,
    deletePortfolio,
    isDeleting,
    togglePublish,
    isTogglingPublish,

    dataCategory,
    dataTech,
  } = usePortfolioManager();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const rows: IPPortfolio[] = dataPortfolio?.data ?? [];

  const openCreate = () => {
    setSelected(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (row: IPPortfolio) => {
    setSelected(row);
    setFormMode("edit");
    setFormOpen(true);
  };

  const openDelete = (row: IPPortfolio) => {
    setSelected(row);
    setDeleteOpen(true);
  };

  const handleSubmit = (values: PortfolioFormValues) => {
    if (formMode === "edit" && selected?.id) {
      updatePortfolio(
        { id: selected.id, payload: { ...values, id: selected.id } },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createPortfolio(values, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (!selected?.id) return;
    deletePortfolio(selected.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setSelected(null);
      },
    });
  };

  const columns: ColumnDef<IPPortfolio>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium">{row.original.title}</div>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => (
        <div className="text-left font-mono text-sm">{row.original.slug}</div>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium">
          {row.original.category?.name ?? "-"}
        </div>
      ),
      accessorFn: (row) => row.category?.name,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "isPublished",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Published" />
      ),
      cell: ({ row }) => {
        const project = row.original;
        return (
          <Switch
            checked={!!project.isPublished}
            disabled={isTogglingPublish}
            aria-label={
              project.isPublished ? "Unpublish project" : "Publish project"
            }
            onCheckedChange={(checked) =>
              togglePublish({ id: project.id, isPublished: checked })
            }
          />
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Update Date" />
      ),
      cell: ({ row }) => (
        <div className="text-left text-sm font-medium">
          {fmtDate(row.original.updatedAt)}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const project = row.original;
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
              <DropdownMenuItem onClick={() => openEdit(project)}>
                <Pencil className="text-amber-500" /> Edit Portfolio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDelete(project)}>
                <Trash className="text-red-500" /> Delete Portfolio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="md:p-6 p-4">
      <SEO
        title="Portfolio"
        description="Manage and review portfolio projects within the system"
      />
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Portfolio management</h1>
          <p>Manage and review portfolio projects within the system</p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Portfolio
        </Button>
      </div>

      <div className="w-full grid gap-2 relative overflow-x-hidden">
        <Card className="mt-3">
          <CardContent>
            {isLoadingPortfolio ? (
              <TableSkeleton rows={6} columns={6} />
            ) : (
              <DataTable
                totalPages={dataPortfolio?.metadata?.totalPages}
                totalData={dataPortfolio?.metadata?.total}
                columns={columns}
                data={rows}
                isLoading={isRefetchingPortfolio}
                refetch={refetchPortfolio}
                excelName="Portfolio"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <PortfolioFormDialog
        open={formOpen}
        setOpen={setFormOpen}
        data={formMode === "edit" ? selected : null}
        isPending={isCreating || isUpdating}
        dataCategory={dataCategory}
        dataTech={dataTech}
        onSubmit={handleSubmit}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete portfolio</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete
              {selected?.title ? ` "${selected.title}"` : " this project"}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPortfolioManager;

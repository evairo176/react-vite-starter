import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";

import { DataTableColumnHeader } from "@/components/shared/table/data-table-column-header";
import { DataTable } from "@/components/shared/table/data-table";
import TableSkeleton from "@/components/shared/skeletons/TableSkeleton";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  Achievement,
  CreateAchievementDTO,
} from "@/core/types/achievement.type";
import AchievementFormModal from "./AchievementFormModal";
import useAchievementManager from "./useAchievementManager";

/**
 * Admin_Achievement_Manager view.
 *
 * Renders the achievement list in a react-table (with a content-shaped
 * TableSkeleton while loading), a create/edit dialog validated by RHF + zod, a
 * delete confirmation dialog, and a publish badge. View state (open dialogs,
 * selected row) is preserved when a mutation errors because the dialogs only
 * close from the success path.
 */
const AchievementManager = () => {
  const {
    dataAchievement,
    isLoadingAchievement,
    refetchAchievement,
    createAchievement,
    isCreating,
    updateAchievement,
    isUpdating,
    deleteAchievement,
    isDeleting,
  } = useAchievementManager();

  const [formModal, setFormModal] = useState(false);
  const [selected, setSelected] = useState<Achievement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);

  const openCreate = () => {
    setSelected(null);
    setFormModal(true);
  };

  const openEdit = (row: Achievement) => {
    setSelected(row);
    setFormModal(true);
  };

  const handleSubmit = (payload: CreateAchievementDTO) => {
    if (selected) {
      updateAchievement(
        { id: selected.id, payload },
        {
          onSuccess: () => {
            setFormModal(false);
            setSelected(null);
          },
        },
      );
    } else {
      createAchievement(payload, {
        onSuccess: () => setFormModal(false),
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteAchievement(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const columns: ColumnDef<Achievement>[] = [
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
      accessorKey: "issuer",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Issuer" />
      ),
      cell: ({ row }) =>
        row.original.issuer ? (
          <div className="text-left text-sm">{row.original.issuer}</div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) =>
        row.original.category ? (
          <Badge variant="secondary" className="capitalize">
            {row.original.category}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <div className="text-left text-sm font-medium">
          {fmtDate(row.original.date)}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "isPublished",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Published" />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.isPublished ? "default" : "outline"}>
          {row.original.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "position",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Position" />
      ),
      cell: ({ row }) => (
        <div className="text-left text-sm font-medium">
          {row.original.position}
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openEdit(row.original)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteTarget(row.original)}>
              <Trash className="w-4 h-4 mr-2 text-red-500" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="md:p-6 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">
            Manage awards, certifications &amp; milestones
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Achievement
        </Button>
      </div>

      <div className="w-full grid gap-2 relative overflow-x-hidden">
        <Card className="mt-3">
          <CardContent>
            {isLoadingAchievement ? (
              <TableSkeleton rows={6} columns={6} />
            ) : (
              <DataTable
                totalPages={dataAchievement?.metadata?.totalPages}
                totalData={dataAchievement?.metadata?.total}
                columns={columns}
                data={(dataAchievement?.data as Achievement[]) || []}
                isLoading={isLoadingAchievement}
                refetch={refetchAchievement}
                excelName="Achievement"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <AchievementFormModal
        open={formModal}
        setOpen={setFormModal}
        data={selected}
        isSubmitting={isCreating || isUpdating}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete achievement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete
              {deleteTarget ? ` "${deleteTarget.title}"` : " this achievement"}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AchievementManager;

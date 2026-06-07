import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Check, MessageSquare, MoreHorizontal, Trash } from "lucide-react";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AdminComment } from "@/core/types/blogPost.type";

import useCommentManager, {
  type CommentStatusFilter,
} from "./useCommentManager";

const FILTERS: { value: CommentStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
];

/**
 * Admin_Comment_Manager view. Lists blog comments in a DataTable with a status
 * filter (all/pending/approved) and stat badges for the pending/approved/total
 * counts. Admins approve pending comments (fixing the "comments not showing"
 * bug) or delete any comment through the row actions menu, with a delete
 * confirmation dialog. Mutations + toasts are owned by `useCommentManager`.
 * (Req 4.7)
 */
const AdminCommentManager = () => {
  const {
    comments,
    metadata,
    isLoadingComments,
    refetchComments,
    status,
    setStatus,
    counts,
    approve,
    isApproving,
    remove,
    isDeleting,
  } = useCommentManager();

  const [deleteTarget, setDeleteTarget] = useState<AdminComment | null>(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    remove(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const columns: ColumnDef<AdminComment>[] = [
    {
      id: "author",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Author" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col text-left">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.email}
          </span>
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "body",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Comment" />
      ),
      cell: ({ row }) => (
        <p className="line-clamp-2 max-w-xs text-left text-sm text-muted-foreground">
          {row.original.body}
        </p>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: "post",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Post" />
      ),
      cell: ({ row }) =>
        row.original.post ? (
          <Link
            to="/blog/$slug"
            params={{ slug: row.original.post.slug }}
            className="text-left text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {row.original.post.title}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "isApproved",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) =>
        row.original.isApproved ? (
          <Badge variant="default">Approved</Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          >
            Pending
          </Badge>
        ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <div className="text-left text-sm font-medium">
          {fmtDate(row.original.createdAt)}
        </div>
      ),
      enableSorting: true,
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
            {!row.original.isApproved ? (
              <DropdownMenuItem
                disabled={isApproving}
                onClick={() => approve(row.original.id)}
              >
                <Check className="mr-2 h-4 w-4 text-emerald-500" />
                Approve
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={() => setDeleteTarget(row.original)}>
              <Trash className="mr-2 h-4 w-4 text-red-500" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="md:p-6 p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <MessageSquare className="h-6 w-6 text-primary" />
            Comment moderation
          </h1>
          <p className="text-muted-foreground">
            Review, approve, or delete comments submitted on your blog posts
          </p>
        </div>

        {/* Stat badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          >
            Pending: {counts.pending}
          </Badge>
          <Badge variant="default">Approved: {counts.approved}</Badge>
          <Badge variant="secondary">Total: {counts.total}</Badge>
        </div>
      </div>

      {/* Status filter */}
      <Tabs
        value={status}
        onValueChange={(value) => setStatus(value as CommentStatusFilter)}
        className="mb-2"
      >
        <TabsList aria-label="Filter comments by status">
          {FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative grid w-full gap-2 overflow-x-hidden">
        <Card className="mt-3">
          <CardContent>
            {isLoadingComments ? (
              <TableSkeleton rows={6} columns={6} />
            ) : (
              <DataTable
                totalPages={metadata?.totalPages}
                totalData={metadata?.total}
                columns={columns}
                data={comments}
                isLoading={isLoadingComments}
                refetch={refetchComments}
                excelName="Comments"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete comment</DialogTitle>
            <DialogDescription>
              This permanently removes the comment
              {deleteTarget ? ` by ${deleteTarget.name}` : ""}. This action
              cannot be undone.
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

export default AdminCommentManager;

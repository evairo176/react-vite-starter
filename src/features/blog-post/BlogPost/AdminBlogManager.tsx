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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  AdminBlogPost,
  CreateBlogPostDTO,
} from "@/core/types/blogPost.type";
import BlogFormModal from "./BlogFormModal";
import useBlogManager from "./useBlogManager";

/**
 * Admin_Blog_Manager view (Req 10.1, 10.6, 10.7, 10.8, 16.5).
 *
 * Renders the post list in a react-table (with a content-shaped TableSkeleton
 * while loading), a create/edit dialog with category + tag assignment, a delete
 * confirmation dialog, and an inline publish toggle. View state (open dialogs,
 * selected row) is preserved when a mutation errors because the dialogs only
 * close from the success path.
 */
const AdminBlogManager = () => {
  const {
    dataBlogPost,
    isLoadingBlogPost,
    refetchBlogPost,
    categoryOptions,
    tagOptions,
    createPost,
    isCreating,
    updatePost,
    isUpdating,
    deletePost,
    isDeleting,
    togglePublish,
    isTogglingPublish,
  } = useBlogManager();

  const [formModal, setFormModal] = useState(false);
  const [selected, setSelected] = useState<AdminBlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBlogPost | null>(null);

  const openCreate = () => {
    setSelected(null);
    setFormModal(true);
  };

  const openEdit = (row: AdminBlogPost) => {
    setSelected(row);
    setFormModal(true);
  };

  const handleSubmit = (payload: CreateBlogPostDTO) => {
    if (selected) {
      updatePost(
        { id: selected.id, payload },
        {
          onSuccess: () => {
            setFormModal(false);
            setSelected(null);
          },
        },
      );
    } else {
      createPost(payload, {
        onSuccess: () => setFormModal(false),
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deletePost(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const columns: ColumnDef<AdminBlogPost>[] = [
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
        <div className="text-left font-medium font-mono text-xs">
          {row.original.slug}
        </div>
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
          <Badge variant="secondary">{row.original.category.name}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "isPublished",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Published" />
      ),
      cell: ({ row }) => {
        const post = row.original;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={post.isPublished}
              disabled={isTogglingPublish}
              aria-label={
                post.isPublished ? "Unpublish post" : "Publish post"
              }
              onCheckedChange={(checked) =>
                togglePublish({ id: post.id, isPublished: checked })
              }
            />
            <Badge variant={post.isPublished ? "default" : "outline"}>
              {post.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "totalViews",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Views" />
      ),
      cell: ({ row }) => (
        <div className="text-left text-sm font-medium">
          {row.original.totalViews}
        </div>
      ),
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
          <h1 className="text-2xl font-bold">Blog management</h1>
          <p className="text-muted-foreground">
            Manage and review blog post data
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Post
        </Button>
      </div>

      <div className="w-full grid gap-2 relative overflow-x-hidden">
        <Card className="mt-3">
          <CardContent>
            {isLoadingBlogPost ? (
              <TableSkeleton rows={6} columns={6} />
            ) : (
              <DataTable
                totalPages={dataBlogPost?.metadata?.totalPages}
                totalData={dataBlogPost?.metadata?.total}
                columns={columns}
                data={(dataBlogPost?.data as AdminBlogPost[]) || []}
                isLoading={isLoadingBlogPost}
                refetch={refetchBlogPost}
                excelName="BlogPost"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <BlogFormModal
        open={formModal}
        setOpen={setFormModal}
        data={selected}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        isSubmitting={isCreating || isUpdating}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete
              {deleteTarget ? ` "${deleteTarget.title}"` : " this post"}? This
              action cannot be undone.
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

export default AdminBlogManager;

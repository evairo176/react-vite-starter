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
import type { IBlogPost } from "@/core/types/blogPost.type";
import AddModal from "./AddModal/AddModal";
import EditModal from "./EditModal/EditModal";
import useBlogPost from "./useBlogPost";

const BlogPost = () => {
  const { dataBlogPost, isLoadingBlogPost, refetchBlogPost } = useBlogPost();

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState<IBlogPost | null>(null);

  const columns: ColumnDef<IBlogPost>[] = [
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
      cell: ({ row }) => {
        const table = row.original;
        return (
          <div className="text-left font-medium font-mono text-xs">
            {table.slug}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "isPublished",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Published" />
      ),
      cell: ({ row }) => {
        const table = row.original;
        return (
          <div className="text-left text-sm font-medium">
            {table.isPublished ? "Yes" : "No"}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "totalViews",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Views" />,
      cell: ({ row }) => {
        const table = row.original;
        return <div className="text-left text-sm font-medium">{table.totalViews}</div>;
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "totalLikes",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Likes" />,
      cell: ({ row }) => {
        const table = row.original;
        return <div className="text-left text-sm font-medium">{table.totalLikes}</div>;
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
        const table = row.original;
        return (
          <div className="text-left text-sm font-medium">{fmtDate(table.updatedAt)}</div>
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
                    dataBlogPost?.data?.find((row: IBlogPost) => row.id === table.id) ||
                    null;
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
          <h1 className="text-2xl font-bold">Blog management</h1>
          <p className="text-muted-foreground">Manage and review blog post data</p>
        </div>
        <Button onClick={() => setAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Post
        </Button>
      </div>

      <div className="w-full grid gap-2 relative overflow-x-hidden">
        <Card className="mt-3">
          <CardContent>
            <DataTable
              totalPages={dataBlogPost?.metadata?.totalPages}
              totalData={dataBlogPost?.metadata?.total}
              columns={columns}
              data={dataBlogPost?.data || []}
              isLoading={isLoadingBlogPost}
              refetch={refetchBlogPost}
              excelName="BlogPost"
            />
          </CardContent>
        </Card>
      </div>

      <AddModal
        open={addModal}
        setOpen={setAddModal}
        refetch={refetchBlogPost}
      />
      <EditModal
        open={editModal}
        setOpen={setEditModal}
        data={selected}
        refetch={refetchBlogPost}
      />
    </div>
  );
};

export default BlogPost;

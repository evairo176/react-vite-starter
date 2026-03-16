import { Eye, Pencil, Plus, Save, Trash, X } from "lucide-react";
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
import useClaim from "./useClaim";
import type { IClaim } from "@/core/types/claim.type";
import AddModal from "./AddModal";
import SubmitModal from "./SubmitModal";
import ReviewModal from "./ReviewModal";
import ApproveModal from "./ApproveModal";
import RejectModal from "./RejectModal";
import DetailModal from "./DetailModal";
import { FileText, Send, CheckCircle, XCircle } from "lucide-react";
import { useAuthStore } from "@/core/store/authStore";

const statusMeta: Record<string, { icon: React.ReactNode; className: string }> =
  {
    DRAFT: {
      icon: <FileText className="w-4 h-4" />,
      className: "bg-gray-100 text-gray-700",
    },

    SUBMITTED: {
      icon: <Send className="w-4 h-4" />,
      className: "bg-blue-100 text-blue-700",
    },

    REVIEWED: {
      icon: <Eye className="w-4 h-4" />,
      className: "bg-yellow-100 text-yellow-700",
    },

    APPROVED: {
      icon: <CheckCircle className="w-4 h-4" />,
      className: "bg-green-100 text-green-700",
    },

    REJECTED: {
      icon: <XCircle className="w-4 h-4" />,
      className: "bg-red-100 text-red-700",
    },
  };

const Claim = () => {
  const { user } = useAuthStore();
  const { dataClaim, isLoadingClaim, refetchClaim } = useClaim();

  const [addModal, setAddModal] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selected, setSelected] = useState<IClaim | null>(null);

  const columns: ColumnDef<IClaim>[] = [
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
      accessorKey: "desc",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const table: any = row.original;
        return <div className="text-left font-medium">{table.desc}</div>;
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const table: any = row.original;

        const meta = statusMeta[table.status];

        return (
          <div
            className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${meta?.className}`}
          >
            {meta?.icon}
            {table.status}
          </div>
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
              {table.status === "DRAFT" && (
                <DropdownMenuItem
                  onClick={() => {
                    const data =
                      dataClaim?.data?.find(
                        (row: IClaim) => row.id === table.id,
                      ) || null;
                    setSelected(data);
                    setSubmitModal(true);
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  <p>Submit</p>
                </DropdownMenuItem>
              )}

              {table.status === "SUBMITTED" && (
                <DropdownMenuItem
                  onClick={() => {
                    const data =
                      dataClaim?.data?.find(
                        (row: IClaim) => row.id === table.id,
                      ) || null;
                    setSelected(data);
                    setReviewModal(true);
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  <p>Review</p>
                </DropdownMenuItem>
              )}

              {table.status === "REVIEWED" && (
                <DropdownMenuItem
                  onClick={() => {
                    const data =
                      dataClaim?.data?.find(
                        (row: IClaim) => row.id === table.id,
                      ) || null;
                    setSelected(data);
                    setApproveModal(true);
                  }}
                >
                  <Save className="w-4 h-4 mr-2 text-green-600" />
                  <p className="text-green-600">Approve</p>
                </DropdownMenuItem>
              )}

              {table.status === "REVIEWED" && (
                <DropdownMenuItem
                  onClick={() => {
                    const data =
                      dataClaim?.data?.find(
                        (row: IClaim) => row.id === table.id,
                      ) || null;
                    setSelected(data);
                    setRejectModal(true);
                  }}
                >
                  <X className="w-4 h-4 mr-2 text-red-600" />
                  <p className="text-red-600">Reject</p>
                </DropdownMenuItem>
              )}

              {table.status !== "DRAFT" && (
                <DropdownMenuItem
                  onClick={() => {
                    const data =
                      dataClaim?.data?.find(
                        (row: IClaim) => row.id === table.id,
                      ) || null;
                    setSelected(data);
                    setDetailModal(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2 text-blue-600" />
                  <p className="text-blue-600">Detail</p>
                </DropdownMenuItem>
              )}
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
          <h1 className="text-2xl font-bold">Claim management</h1>
          <p className="text-muted-foreground">Manage and review Claim data</p>
        </div>
        {user?.role === "USER" && (
          <Button onClick={() => setAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Claim
          </Button>
        )}
      </div>

      <div className="w-full grid gap-2 relative overflow-x-hidden">
        <Card className="mt-3">
          <CardContent>
            <DataTable
              totalPages={dataClaim?.metadata?.totalPages}
              totalData={dataClaim?.metadata?.total}
              columns={columns}
              data={dataClaim?.data || []}
              isLoading={isLoadingClaim}
              refetch={refetchClaim}
              excelName="Claim"
            />
          </CardContent>
        </Card>
      </div>
      <AddModal open={addModal} setOpen={setAddModal} refetch={refetchClaim} />
      {selected && (
        <SubmitModal
          open={submitModal}
          setOpen={setSubmitModal}
          data={selected}
          refetch={refetchClaim}
        />
      )}
      {selected && (
        <ReviewModal
          open={reviewModal}
          setOpen={setReviewModal}
          data={selected}
          refetch={refetchClaim}
        />
      )}
      {selected && (
        <ApproveModal
          open={approveModal}
          setOpen={setApproveModal}
          data={selected}
          refetch={refetchClaim}
        />
      )}
      {selected && (
        <RejectModal
          open={rejectModal}
          setOpen={setRejectModal}
          data={selected}
          refetch={refetchClaim}
        />
      )}
      {selected && (
        <DetailModal
          open={detailModal}
          setOpen={setDetailModal}
          data={selected}
          refetch={refetchClaim}
        />
      )}
    </div>
  );
};

export default Claim;

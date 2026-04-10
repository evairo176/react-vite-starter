import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IProduct } from "@/core/types/product.type";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/core/utils/date";

interface DetailModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any;
}

export default function DetailModal({ open, setOpen, data }: DetailModalProps) {
  const purchases = data.transactionItems.filter(
    (item: any) => item.transaction.type === "PURCHASE",
  );

  const sales = data.transactionItems.filter(
    (item: any) => item.transaction.type === "SALE",
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-full sm:max-w-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>Detail Product</DialogTitle>
          <DialogDescription>
            View the details of your product.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* NAME */}

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{data.name}</p>
                </div>

                {/* SKU */}

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="text-lg font-medium font-mono">{data.sku}</p>
                </div>

                {/* PRICE */}

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-lg font-medium">
                    Rp {data.price.toLocaleString()}
                  </p>
                </div>

                {/* STOCK */}

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Stock</p>

                  <Badge className="text-sm px-3 py-1">{data.stock}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="purchase">
            <TabsList>
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
              <TabsTrigger value="sale">Sale</TabsTrigger>
              <TabsTrigger value="logs">Stock Log</TabsTrigger>
            </TabsList>

            {/* PURCHASE */}

            <TabsContent value="purchase">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase History</CardTitle>
                </CardHeader>

                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {purchases.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>
                            Rp {item.price.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {formatDate(item.transaction.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SALE */}

            <TabsContent value="sale">
              <Card>
                <CardHeader>
                  <CardTitle>Sale History</CardTitle>
                </CardHeader>

                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {sales.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>
                            Rp {item.price.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {formatDate(item.transaction.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* STOCK LOG */}

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Movement</CardTitle>
                </CardHeader>

                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Before</TableHead>
                        <TableHead>After</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {data.logs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge
                              variant={
                                log.type === "PURCHASE"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {log.type}
                            </Badge>
                          </TableCell>

                          <TableCell>{log.qty}</TableCell>
                          <TableCell>{log.stockBefore}</TableCell>
                          <TableCell>{log.stockAfter}</TableCell>
                          <TableCell>{log.user.name}</TableCell>

                          <TableCell>{formatDate(log.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button" className="gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { Order, User } from "@/types";
import Navigation from "@/components/navigation";

export default function AdminOrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/auth/login");
      return;
    }

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!userData?.is_admin) {
      router.push("/");
      return;
    }

    setUser(userData);
    fetchOrders();
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        });
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      // If changing to delivered, also update payment status to paid
      const updateData: any = { status };
      if (status === "delivered") {
        updateData.payment_status = "paid";
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Order status updated successfully${
            status === "delivered" ? " and marked as paid" : ""
          }`,
        });
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const generatePDF = (order: Order) => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order #${order.id.slice(0, 8)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-info { margin-bottom: 20px; }
          .customer-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
          .address { background: #e8f4f8; padding: 15px; margin-bottom: 20px; }
          .status { padding: 5px 10px; border-radius: 5px; display: inline-block; }
          .pending { background: #fef3c7; color: #92400e; }
          .processing { background: #dbeafe; color: #1e40af; }
          .shipped { background: #f3e8ff; color: #7c3aed; }
          .delivered { background: #d1fae5; color: #065f46; }
          .cancelled { background: #fee2e2; color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>StyleCo</h1>
          <h2>Order Details</h2>
        </div>
        
        <div class="order-info">
          <h3>Order #${order.id.slice(0, 8)}</h3>
          <p><strong>Date:</strong> ${new Date(
            order.created_at
          ).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span class="status ${
            order.status
          }">${order.status.toUpperCase()}</span></p>
          <p><strong>Payment Method:</strong> ${
            order.payment_method === "cash_on_delivery"
              ? "Cash on Delivery"
              : "Credit Card"
          }</p>
          <p><strong>Total Amount:</strong> ${order.total_amount.toFixed(
            2
          )} EGP</p>
        </div>

        <div class="customer-info">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${
            order.shipping_address?.fullName || "N/A"
          }</p>
          <p><strong>Phone:</strong> ${
            order.shipping_address?.phone || "N/A"
          }</p>
          ${
            order.shipping_address?.alternativePhone
              ? `<p><strong>Alternative Phone:</strong> ${order.shipping_address.alternativePhone}</p>`
              : ""
          }
        </div>

        <div class="address">
          <h3>Delivery Address</h3>
          <p>${order.shipping_address?.address || "N/A"}</p>
          <p>${order.shipping_address?.city || "N/A"}, ${
      order.shipping_address?.governorate || "N/A"
    }</p>
          <p>${order.shipping_address?.country || "N/A"}</p>
          ${
            order.shipping_address?.zipCode
              ? `<p>Postal Code: ${order.shipping_address.zipCode}</p>`
              : ""
          }
        </div>

        <div style="margin-top: 30px; text-align: center; color: #666;">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window and write the HTML content
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }

    toast({
      title: "PDF Generated",
      description: "Order details have been opened for printing/saving as PDF",
    });
  };

  const exportAllOrdersPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>All Orders Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .status { padding: 3px 8px; border-radius: 3px; font-size: 12px; }
          .pending { background: #fef3c7; color: #92400e; }
          .processing { background: #dbeafe; color: #1e40af; }
          .shipped { background: #f3e8ff; color: #7c3aed; }
          .delivered { background: #d1fae5; color: #065f46; }
          .cancelled { background: #fee2e2; color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>StyleCo</h1>
          <h2>All Orders Report</h2>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Governorate</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${orders
              .map(
                (order) => `
              <tr>
                <td>#${order.id.slice(0, 8)}</td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>${order.shipping_address?.fullName || "N/A"}</td>
                <td>${order.shipping_address?.phone || "N/A"}</td>
                <td>${order.shipping_address?.address || "N/A"}</td>
                <td>${order.shipping_address?.governorate || "N/A"}</td>
                <td>${order.total_amount.toFixed(2)} EGP</td>
                <td><span class="status ${
                  order.status
                }">${order.status.toUpperCase()}</span></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div style="margin-top: 30px;">
          <p><strong>Total Orders:</strong> ${orders.length}</p>
          <p><strong>Total Revenue (Delivered):</strong> ${orders
            .filter((o) => o.status === "delivered")
            .reduce((sum, o) => sum + o.total_amount, 0)
            .toFixed(2)} EGP</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }

    toast({
      title: "All Orders PDF Generated",
      description:
        "Complete orders report has been opened for printing/saving as PDF",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      processing: { variant: "default" as const, label: "Processing" },
      shipped: { variant: "outline" as const, label: "Shipped" },
      delivered: { variant: "default" as const, label: "Delivered" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order Management
            </h1>
            <p className="text-gray-600">View and manage customer orders</p>
          </div>
          <Button
            onClick={exportAllOrdersPDF}
            className="flex items-center gap-2sm:self-center"
          >
            <FileText className="h-4 w-4" />
            Export All Orders (PDF)
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <p className="font-mono text-sm">
                          #{order.id.slice(0, 8)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">
                          {order.shipping_address?.fullName || "N/A"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {order.shipping_address?.phone || "N/A"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {order.total_amount.toFixed(2)} EGP
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Order Details #{order.id.slice(0, 8)}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Customer Information
                                      </h4>
                                      <div className="text-sm space-y-1">
                                        <p>
                                          <strong>Name:</strong>{" "}
                                          {
                                            selectedOrder.shipping_address
                                              ?.fullName
                                          }
                                        </p>
                                        <p>
                                          <strong>Phone:</strong>{" "}
                                          {
                                            selectedOrder.shipping_address
                                              ?.phone
                                          }
                                        </p>
                                        {selectedOrder.shipping_address
                                          ?.alternativePhone && (
                                          <p>
                                            <strong>Alt Phone:</strong>{" "}
                                            {
                                              selectedOrder.shipping_address
                                                .alternativePhone
                                            }
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Order Information
                                      </h4>
                                      <div className="text-sm space-y-1">
                                        <p>
                                          <strong>Date:</strong>{" "}
                                          {new Date(
                                            selectedOrder.created_at
                                          ).toLocaleDateString()}
                                        </p>
                                        <p>
                                          <strong>Total:</strong>{" "}
                                          {selectedOrder.total_amount.toFixed(
                                            2
                                          )}{" "}
                                          EGP
                                        </p>
                                        <p>
                                          <strong>Payment:</strong>{" "}
                                          {selectedOrder.payment_method}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Shipping Address
                                    </h4>
                                    <div className="text-sm bg-gray-50 p-3 rounded">
                                      <p>
                                        {
                                          selectedOrder.shipping_address
                                            ?.address
                                        }
                                      </p>
                                      <p>
                                        {selectedOrder.shipping_address?.city},{" "}
                                        {
                                          selectedOrder.shipping_address
                                            ?.governorate
                                        }
                                      </p>
                                      <p>
                                        {
                                          selectedOrder.shipping_address
                                            ?.country
                                        }
                                      </p>
                                      {selectedOrder.shipping_address
                                        ?.zipCode && (
                                        <p>
                                          Postal Code:{" "}
                                          {
                                            selectedOrder.shipping_address
                                              .zipCode
                                          }
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => generatePDF(selectedOrder)}
                                      size="sm"
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Export PDF
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generatePDF(order)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              updateOrderStatus(order.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">
                                Processing
                              </SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">
                                Delivered
                              </SelectItem>
                              <SelectItem value="cancelled">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {orders.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

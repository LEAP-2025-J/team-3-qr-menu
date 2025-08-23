"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { formatPrice } from "../utils";

interface Order {
  _id: string;
  orderNumber: string;
  table: { number: number };
  items: Array<{
    menuItem: { name: string; nameEn: string; price: number };
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
}

interface OrdersListProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: string) => void;
}

export function OrdersList({ orders, onUpdateStatus }: OrdersListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "served":
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparing":
        return <Clock className="w-4 h-4" />;
      case "ready":
        return <CheckCircle className="w-4 h-4" />;
      case "served":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <Card key={order._id} className="transition-shadow hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                  <p className="text-sm text-gray-500">
                    Table {order.table.number} • {formatTime(order.createdAt)}
                  </p>
                  {order.customerName && (
                    <p className="text-sm text-gray-600">
                      Customer: {order.customerName}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1 capitalize">{order.status}</span>
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    ${order.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} items
                  </p>
                </div>
                <div className="flex space-x-2">
                  {order.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => onUpdateStatus(order._id, "preparing")}
                    >
                      Start Preparing
                    </Button>
                  )}
                  {order.status === "preparing" && (
                    <Button
                      size="sm"
                      onClick={() => onUpdateStatus(order._id, "ready")}
                    >
                      Mark Ready
                    </Button>
                  )}
                  {order.status === "ready" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateStatus(order._id, "served")}
                    >
                      Mark Served
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-3 mt-4 rounded-lg bg-gray-50">
              <h4 className="mb-2 font-medium">Order Items:</h4>
              <div className="space-y-1">
                {order.items
                  .filter((item) => item.menuItem) // Only show items with valid menuItem
                  .map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.menuItem.nameEn}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

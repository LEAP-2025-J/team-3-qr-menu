"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Order } from "@/hooks/use-admin-data";

interface OrderHistoryProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
}

export function OrderHistory({ orders, onUpdateStatus }: OrderHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "serving":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Хүлээгдэж буй";
      case "preparing":
        return "Бэлтгэж буй";
      case "serving":
        return "Хооллож буй";
      case "completed":
        return "Дууссан";
      case "cancelled":
        return "Цуцлагдсан";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order._id} className="p-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-lg font-semibold">
                  Захиалга #{order.orderNumber}
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
                <span className="text-sm text-gray-600">
                  Ширээ {order.table.number}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(order.createdAt)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-2">
              {order.items
                .filter(item => item.menuItem) // Only show items with valid menuItem
                .map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.menuItem.nameEn} x {item.quantity}
                  </span>
                  <span>¥{item.price.toLocaleString()}</span>
                </div>
              ))}
              

            </div>

            <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold">
                  Нийт: ¥{order.total.toLocaleString()}
                </span>
                {order.customerName && (
                  <span>Хэрэглэгч: {order.customerName}</span>
                )}
                {order.customerPhone && (
                  <span>Утас: {order.customerPhone}</span>
                )}
              </div>

              <div className="flex gap-2">
                {order.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus(order._id, "preparing")}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Бэлтгэж эхлэх
                  </Button>
                )}
                {order.status === "preparing" && (
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus(order._id, "serving")}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Хоол гаргах
                  </Button>
                )}
                {order.status === "serving" && (
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus(order._id, "completed")}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Дуусгах
                  </Button>
                )}
                {(order.status === "pending" || order.status === "preparing") && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onUpdateStatus(order._id, "cancelled")}
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Цуцлах
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

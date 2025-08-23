"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatTime } from "../utils/date-utils";
import { formatPrice } from "../utils/price-utils";

interface TotalOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: any;
  onPrint?: () => void;
}

export function TotalOrdersModal({
  isOpen,
  onClose,
  table,
  onPrint,
}: TotalOrdersModalProps) {
  // Тухайн ширээний session-ийн бүх захиалгыг цуглуулах
  const sessionOrders =
    (table as any).orders?.filter(
      (order: any) =>
        order.status !== "completed" &&
        order.status !== "cancelled" &&
        isOrderActive(order)
    ) || [];

  // Бүх захиалгын items-ийг нэгтгэх
  const allItems = sessionOrders.flatMap((order: any) =>
    order.items
      .filter((item: any) => item.menuItem)
      .map((item: any) => ({
        ...item,
        orderNumber: order.orderNumber,
        orderTime: order.createdAt,
      }))
  );

  // Items-ийг нэрээр нь групчлэх
  const groupedItems = allItems.reduce((acc: any, item: any) => {
    const key = item.menuItem._id;
    if (!acc[key]) {
      acc[key] = {
        menuItem: item.menuItem,
        totalQuantity: 0,
        totalPrice: 0,
        orders: [],
      };
    }
    acc[key].totalQuantity += item.quantity;
    acc[key].totalPrice += item.quantity * item.menuItem.price;
    acc[key].orders.push({
      orderNumber: item.orderNumber,
      orderTime: item.orderTime,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions,
    });
    return acc;
  }, {});

  // Нийт үнийн дүнг тооцоолох
  const totalAmount = Object.values(groupedItems).reduce(
    (sum: number, item: any) => sum + item.totalPrice,
    0
  );

  // Хэвлэх функц
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Ширээ {table.number} - Нийт захиалга
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Захиалгын мэдээлэл */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Нийт захиалга:</span>{" "}
                {sessionOrders.length}
              </div>
              <div>
                <span className="font-medium">Нийт дүн:</span>{" "}
                <span className="font-bold text-lg">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Хоолны жагсаалт */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Хоолны жагсаалт:</h3>
            {Object.values(groupedItems).map((item: any, index: number) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 bg-white"
              >
                {/* Хоолны нэр */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {item.menuItem.nameMn || item.menuItem.name}
                    </div>
                    {item.menuItem.nameJp && (
                      <div className="text-sm text-gray-600">
                        {item.menuItem.nameJp}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {item.totalQuantity} ширхэг
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      {formatPrice(item.totalPrice)}
                    </div>
                  </div>
                </div>

                {/* Захиалгын дэлгэрэнгүй */}
                <div className="space-y-1">
                  {item.orders.map((order: any, orderIndex: number) => (
                    <div
                      key={orderIndex}
                      className="text-sm text-gray-600 border-l-2 border-blue-200 pl-2"
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          #{order.orderNumber} - {formatTime(order.orderTime)}
                        </span>
                        <span className="font-medium">
                          {order.quantity} ширхэг
                        </span>
                      </div>
                      {order.specialInstructions && (
                        <div className="text-xs italic text-blue-600 mt-1">
                          {order.specialInstructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Хэвлэх товч */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Хаах
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Хэвлэх
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// isOrderActive функцийг import хийх
function isOrderActive(order: any): boolean {
  if (!order || !order.createdAt) {
    return false;
  }

  // Өнөөдрийн огноог UTC+8 timezone-тай болгож авах (Mongolia timezone)
  const now = new Date();
  const utc8Date = new Date(now.getTime() + 8 * 60 * 60 * 1000); // UTC+8
  const todayString = utc8Date.toISOString().split("T")[0]; // YYYY-MM-DD формат

  // Захиалгын огноог шалгах
  const orderDate = new Date(order.createdAt);
  const orderDateString = orderDate.toISOString().split("T")[0]; // YYYY-MM-DD формат

  return orderDateString === todayString;
}

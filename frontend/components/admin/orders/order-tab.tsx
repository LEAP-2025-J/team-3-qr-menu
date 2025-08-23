"use client";

import { Button } from "@/components/ui/button";
import { QrCode, Plus, Printer, Receipt } from "lucide-react";
import { Table } from "../types";
import { getPrimaryActionLabel } from "../utils/order-utils";
import { formatTime } from "../utils/date-utils";
import { TotalOrdersModal } from "./total-orders-modal";
import { useState } from "react";

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

interface OrderTabProps {
  table: Table;
  isUpdating: boolean;
  onAdvanceStatus: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onCreateOrder: () => void;
  onPrintOrder?: (orderId: string) => void;
}

export function OrderTab({
  table,
  isUpdating,
  onAdvanceStatus,
  onCancelOrder,
  onCreateOrder,
  onPrintOrder,
}: OrderTabProps) {
  const [showTotalOrdersModal, setShowTotalOrdersModal] = useState(false);
  // Тухайн ширээнд сууснаас хойшхи бүх захиалга (completed, cancelled биш, өчигдрийн захиалга биш)
  const sessionOrders =
    (table as any).orders?.filter(
      (order: any) =>
        order.status !== "completed" &&
        order.status !== "cancelled" &&
        isOrderActive(order) // Зөвхөн өнөөдрийн захиалгуудыг харуулах
    ) || [];

  if (sessionOrders.length === 0) {
    return (
      <div className="h-full p-3 m-0 space-y-2 bg-blue-50">
        <div className="flex gap-2 pt-4 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onCreateOrder}
          >
            <QrCode className="w-4 h-4 mr-2" />
            Захиалга үүсгэх
          </Button>
        </div>

        {/* Нийт захиалга Modal */}
        <TotalOrdersModal
          isOpen={showTotalOrdersModal}
          onClose={() => setShowTotalOrdersModal(false)}
          table={table}
        />
      </div>
    );
  }

  return (
    <div className="h-full p-3 m-0 space-y-3 bg-blue-50">
      {/* Захиалгын жагсаалт */}
      {sessionOrders.map((order, orderIndex) => (
        <div
          key={order._id}
          className="border border-gray-200 rounded-lg p-3 bg-white"
        >
          {/* Захиалгын гарчиг */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">
              #{order.orderNumber}
            </span>
            <span className="text-sm font-bold">
              {formatTime(order.createdAt)}
            </span>
          </div>

          {/* Хоолны жагсаалт */}
          <div className="space-y-1 mb-2">
            {order.items
              .filter((item) => item.menuItem)
              .map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.menuItem.nameMn || item.menuItem.name}
                    </div>
                    {item.menuItem.nameJp && (
                      <div className="text-xs text-gray-500">
                        {item.menuItem.nameJp}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <div className="text-xs italic text-blue-600">
                        {item.specialInstructions}
                      </div>
                    )}
                  </div>
                  <div className="font-bold">{item.quantity}</div>
                </div>
              ))}
          </div>

          {/* Захиалгын нийт мөнгө */}
          <div className="flex items-center justify-between mb-2 hidden">
            <span className="text-sm font-medium text-gray-700">Нийт:</span>
            <span className="text-sm font-bold text-gray-900">
              ${order.total.toLocaleString()}
            </span>
          </div>

          {/* Захиалгын үйлдлийн товчнууд */}
          <div className="flex gap-1">
            {/* Статус өөрчлөх товч */}
            {order.status !== "completed" && order.status !== "cancelled" && (
              <Button
                size="sm"
                className="flex-1 text-black bg-green-100 hover:bg-green-200 px-1 py-1"
                onClick={() => onAdvanceStatus(order._id)}
                disabled={isUpdating}
              >
                {getPrimaryActionLabel(order.status)}
              </Button>
            )}

            {/* Цуцлах товч */}
            <Button
              size="sm"
              className="flex-1 text-black bg-red-100 hover:bg-red-200 px-1 py-1"
              onClick={() => onCancelOrder(order._id)}
              disabled={isUpdating}
            >
              Цуцлах
            </Button>

            {/* Хэвлэх товч (баруун доод) */}
            {onPrintOrder && (
              <Button
                size="sm"
                className="w-12 text-black bg-yellow-100 hover:bg-yellow-200"
                onClick={() => onPrintOrder(order._id)}
                disabled={isUpdating}
              >
                <Printer className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Захиалга нэмэх болон нийт захиалга товчнууд */}
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          className="flex-1 text-black bg-blue-100 hover:bg-blue-200"
          onClick={onCreateOrder}
          disabled={isUpdating}
        >
          Захиалга нэмэх
        </Button>
        <Button
          size="sm"
          className="flex-1 text-black bg-green-100 hover:bg-green-200"
          onClick={() => setShowTotalOrdersModal(true)}
          disabled={isUpdating || sessionOrders.length === 0}
        >
          <Receipt className="w-4 h-4 mr-1" />
          Нийт
        </Button>
      </div>

      {/* Нийт захиалга Modal */}
      <TotalOrdersModal
        isOpen={showTotalOrdersModal}
        onClose={() => setShowTotalOrdersModal(false)}
        table={table}
      />
    </div>
  );
}

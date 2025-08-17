"use client";

import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { Table } from "../types";
import { formatTime, getPrimaryActionLabel } from "../utils";

interface OrderTabProps {
  table: Table;
  isUpdating: boolean;
  onAdvanceStatus: () => void;
  onCancelOrder: (orderId: string) => void;
  onCreateOrder: () => void;
}

export function OrderTab({
  table,
  isUpdating,
  onAdvanceStatus,
  onCancelOrder,
  onCreateOrder,
}: OrderTabProps) {
  if (!table.currentOrder) {
    return (
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
    );
  }

  return (
    <div className="h-full p-3 m-0 space-y-2 bg-blue-50">
      {/* Захиалгын гарчиг */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700 ">
          #{table.currentOrder.orderNumber}
        </span>
        <span className="text-lg font-bold">
          {formatTime(table.currentOrder.createdAt)}
        </span>
      </div>

      {/* Хоолны жагсаалт */}
      <div className="space-y-2">
        {table.currentOrder.items
          .filter((item) => item.menuItem) // Only show items with valid menuItem
          .map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex-1">
                <div className="text-lg font-bold">
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
              <div className="text-lg font-bold">{item.quantity}</div>
            </div>
          ))}
      </div>

      {/* Нийт мөнгө */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-sm font-medium text-gray-700">Нийт:</span>
        <span className="text-lg font-bold text-gray-900">
          ${table.currentOrder.total.toLocaleString()}
        </span>
      </div>

      {/* Үйлдлийн товчнууд */}
      <div className="flex gap-1 pb-2 mb-1">
        {table.currentOrder.status !== "completed" &&
          table.currentOrder.status !== "cancelled" && (
            <Button
              size="sm"
              className="flex-1 text-black bg-green-100 hover:bg-green-200"
              onClick={onAdvanceStatus}
              disabled={isUpdating}
            >
              {getPrimaryActionLabel(table.currentOrder.status)}
            </Button>
          )}
        <Button
          size="sm"
          className="flex-1 text-black bg-red-100 hover:bg-red-200"
          onClick={() => onCancelOrder(table.currentOrder!._id)}
          disabled={isUpdating}
        >
          Цуцлах
        </Button>
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle, X, Printer, Phone } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateOrderModal } from "./create-order-modal";
import { PrintModal } from "./print-modal";
import { OrderTab } from "./order-tab";
import { ReservationTab } from "./reservation-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_CONFIG } from "@/config/api";
import { TableCardProps, Order } from "../types";
import {
  getOrderStatusColor,
  getOrderStatusText,
  formatTime,
  formatDate,
  getNextStatus,
  getPrimaryActionLabel,
  handlePrint as handlePrintUtil,
  requestUpdateStatus,
  isReservationActive,
} from "../utils";
import { isOrderActive } from "./table-utils";

export function TableCard({
  table,
  menuItems,
  tables,
  onStatusChange,
  onViewQR,
  onCompleteOrder,
  onCancelOrder,
  onPrintOrder,
  onCreateOrder,
  onRefresh,
  onEditReservation,
}: TableCardProps) {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [printDevice, setPrintDevice] = useState("browser");
  const [copyCount, setCopyCount] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);

  // Статус өөрчлөх (orderId-тай)
  const handleAdvanceStatus = async (orderId: string) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      // table.orders-оос тухайн order-г олох
      const order = (table as any).orders?.find((o: any) => o._id === orderId);
      if (!order) return;

      const next = getNextStatus(order.status);
      await requestUpdateStatus(orderId, next);
      onRefresh?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  // Хамгийн сүүлийн идэвхтэй захиалгын статусыг олох
  const getLatestActiveOrderStatus = () => {
    if (!(table as any).orders || (table as any).orders.length === 0) {
      return null;
    }

    // Өнөөдрийн огноотой идэвхтэй захиалгуудыг олох (pending, preparing, serving)
    const activeOrders = (table as any).orders.filter(
      (order: any) =>
        ["pending", "preparing", "serving"].includes(order.status) &&
        isOrderActive(order)
    );

    if (activeOrders.length === 0) {
      return null;
    }

    // Хамгийн сүүлийн идэвхтэй захиалгын статусыг буцаах
    return activeOrders[activeOrders.length - 1];
  };

  // Принт функцийг дуудах (orderId-тай)
  const handlePrint = async (orderId: string) => {
    // table.orders-оос тухайн order-г олох
    const order = (table as any).orders?.find((o: any) => o._id === orderId);
    if (!order) return;

    const updateStatus = async () => {
      setIsUpdating(true);
      try {
        await requestUpdateStatus(orderId, "preparing");
        onRefresh?.();
      } catch (e) {
        console.error(e);
      } finally {
        setIsUpdating(false);
      }
    };

    handlePrintUtil(order, table, printDevice, updateStatus);
    setShowPrintModal(false);
  };

  return (
    <>
      <Card
        className={`w-72 h-auto transition-all duration-200 hover:shadow-md pt-2 pb-0 gap-0 flex flex-col px-0 ${(() => {
          // 1. Background өнгө: өнөөдрийн идэвхтэй order байхгүй бол ногоон
          const hasActiveOrder =
            table.currentOrder && isOrderActive(table.currentOrder);
          const bgColor = hasActiveOrder ? "bg-white" : "bg-green-200";

          // 2. Border өнгө: active reservation-тай бол pink, үгүй бол gray
          const hasActiveReservation =
            table.currentReservation &&
            isReservationActive(table.currentReservation);
          const borderColor = hasActiveReservation
            ? "border-pink-400"
            : "border-gray-100";

          return `${bgColor} ${borderColor}`;
        })()}`}
      >
        {/* Table header - at the very top */}
        <div className="px-6 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Ширээ {table.number}</p>
            <div className="flex gap-2">
              {(() => {
                const latestActiveOrder = getLatestActiveOrderStatus();
                if (latestActiveOrder) {
                  return (
                    <Badge
                      className={`text-xs ${getOrderStatusColor(
                        latestActiveOrder.status
                      )}`}
                    >
                      {getOrderStatusText(latestActiveOrder.status)}
                    </Badge>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>

        {/* Tabs for Orders and Reservations - connected to card */}
        <div className="h-full px-4 py-0">
          <Tabs defaultValue="orders" className="w-full mb-0">
            <TabsList className="flex w-full gap-0 bg-white border-b-0">
              <TabsTrigger
                value="orders"
                className="flex-1 h-[40px] data-[state=active]:bg-blue-50 data-[state=active]:text-gray-900 data-[state=active]:shadow-[inset_0_-1px_0_0] data-[state=active]:shadow-gray-200 data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600  transition-all font-medium"
              >
                <QrCode className="w-4 h-4 mr-1" />
                Захиалга
              </TabsTrigger>
              <TabsTrigger
                value="reservations"
                className="flex-1 h-[40px] data-[state=active]:bg-red-50 data-[state=active]:text-gray-900 data-[state=active]:shadow-[inset_0_-1px_0_0] data-[state=active]:shadow-gray-200 data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600  transition-all font-medium"
              >
                <Phone className="w-4 h-4 mr-1" />
                Захиалга
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent
              value="orders"
              className="h-full p-0 m-0 space-y-2 rounded-b-lg bg-blue-50"
            >
              <OrderTab
                table={table}
                isUpdating={isUpdating}
                onAdvanceStatus={handleAdvanceStatus}
                onCancelOrder={(orderId) => onCancelOrder?.(orderId)}
                onCreateOrder={() => setShowCreateOrderModal(true)}
                onPrintOrder={handlePrint}
              />
            </TabsContent>

            {/* Reservations Tab */}
            <TabsContent
              value="reservations"
              className="h-full p-0 m-0 space-y-2 rounded-b-lg bg-red-50"
            >
              <ReservationTab
                table={table}
                onEditReservation={onEditReservation}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Хэвлэх Modal */}
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        order={table.currentOrder || null}
        table={table}
        onPrint={() => {
          if (table.currentOrder) {
            handlePrint(table.currentOrder._id);
          }
        }}
      />

      {/* Захиалга үүсгэх Modal */}
      <CreateOrderModal
        isOpen={showCreateOrderModal}
        onClose={() => setShowCreateOrderModal(false)}
        onSubmit={onCreateOrder || (() => Promise.resolve({ success: false }))}
        tableId={table._id}
        tableNumber={table.number}
        menuItems={menuItems}
      />
    </>
  );
}

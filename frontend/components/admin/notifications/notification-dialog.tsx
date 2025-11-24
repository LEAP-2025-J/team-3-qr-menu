"use client";

import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_CONFIG } from "@/config/api";
import { formatDistanceToNow } from "date-fns";
import { formatPrice } from "@/components/admin/utils/price-utils";

interface QROrder {
  _id: string;
  orderNumber: string;
  table: {
    number: number;
    location?: string;
  };
  items: Array<{
    menuItem: {
      name?: string;
      nameEn?: string;
      nameMn?: string;
      nameJp?: string;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  createdAt: string;
  status: string;
  isReadByAdmin: boolean;
  orderSource: "qr" | "admin";
}

interface NotificationDialogProps {
  children: React.ReactNode; // Badge trigger element
  onMarkAsRead: () => void;
}

export function NotificationDialog({
  children,
  onMarkAsRead,
}: NotificationDialogProps) {
  const [todayOrders, setTodayOrders] = useState<QROrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Popover нээгдэхэд өнөөдрийн захиалгуудыг авах
  useEffect(() => {
    if (open) {
      fetchTodayOrders();
    }
  }, [open]);

  const fetchTodayOrders = async () => {
    try {
      setLoading(true);
      // Локал орчинд локал backend ашиглах
      const backendUrl = window.location.hostname.startsWith("192.168.")
        ? "http://localhost:5000"
        : API_CONFIG.BACKEND_URL;
      const url = `${backendUrl}/api/orders/notifications`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Захиалгуудыг үүссэн хугацаагаар нь эрэмбэлэх (сүүлд үүссэн нь дээр)
          const sortedOrders = (data.data.todayQROrders || []).sort(
            (a: any, b: any) => {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            }
          );
          setTodayOrders(sortedOrders);
        }
      }
    } catch (error) {
      console.error("Error fetching today orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onMarkAsRead(); // Notification тоог тэг болгох
    setOpen(false);
  };

  const getItemName = (item: QROrder["items"][0]) => {
    return (
      item.menuItem.nameMn ||
      item.menuItem.nameEn ||
      item.menuItem.name ||
      "Хоол"
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-96 max-h-[70vh] overflow-hidden p-0"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Өнөөдрийн захиалгын түүх</h3>
          <div className="text-sm text-gray-600">
            Нийт {todayOrders.length} захиалга
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : todayOrders.length === 0 ? (
            <div className="text-center py-8 px-4 text-gray-500">
              <div className="text-4xl mb-2">📱</div>
              <div className="text-base font-medium mb-2">
                Өнөөдөр захиалга алга
              </div>
              <div className="text-sm">Захиалга орж ирэхэд энд харагдана</div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {todayOrders.map((order) => (
                <div
                  key={order._id}
                  className={`border rounded-lg p-3 shadow-sm ${
                    order.orderSource === "admin"
                      ? "bg-gray-50 border-gray-200" // Админ захиалга - саарал өнгө
                      : "bg-white border-blue-200" // QR захиалга - цагаан өнгө, цэнхэр хүрээ
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-blue-600">
                        Ширээ {order.table.number}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {order.orderNumber}
                      </span>
                      <Badge
                        variant={
                          order.status === "pending" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {order.status === "pending"
                          ? "Хүлээгдэж буй"
                          : order.status}
                      </Badge>
                      {/* "Шинэ" badge хасагдсан - суурь өнгө нь цагаан байгаа тул админ оруулсан захиалга гэж ялгагдана */}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatPrice(order.total)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm text-gray-700"
                      >
                        <span>
                          {getItemName(item)} × {item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <Button variant="outline" onClick={handleClose} className="w-full">
            Хаах
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

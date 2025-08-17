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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_CONFIG } from "@/config/api";

// Захиалгын item интерфейс
interface OrderItem {
  menuItem: {
    name: string;
    nameEn: string;
    nameMn?: string;
    nameJp?: string;
  };
  quantity: number;
  price: number;
  specialInstructions?: string;
}

// Захиалгын интерфейс
interface Order {
  _id: string;
  orderNumber: string;
  status:
    | "pending"
    | "preparing"
    | "serving"
    | "completed"
    | "cancelled"
    | "reserved";
  total: number;
  customerName?: string;
  estimatedTime?: number;
  items: OrderItem[];
  createdAt: string;
}

// Reservation interface
interface Reservation {
  _id: string;
  reservationNumber: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
  status: string;
  table?: { number: number };
  specialRequests?: string;
}

// Ширээний интерфейс
interface Table {
  _id: string;
  number: number;
  capacity: number;
  status: "empty" | "reserved";
  location: "main-hall" | "terrace";
  qrCode?: string;
  currentOrder?: Order;
  currentReservation?: Reservation;
  currentReservations?: Reservation[]; // Array of all reservations for this table
}

// Menu item интерфейс
interface MenuItem {
  _id: string;
  name: string;
  nameEn: string;
  nameMn?: string;
  nameJp?: string;
  description?: string;
  price: number;
  category: { name: string; nameEn: string; nameMn?: string };
  image?: string;
}

// Table Card Props
interface TableCardProps {
  table: Table;
  menuItems: MenuItem[];
  tables: Table[]; // Бүх ширээний жагсаалт
  onStatusChange?: (tableId: string, status: "empty" | "reserved") => void;
  onViewQR?: (tableId: string) => void;
  onCompleteOrder?: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  onPrintOrder?: (orderId: string) => void;
  onCreateOrder?: (orderData: {
    tableId: string;
    items: any[];
    total: number;
  }) => Promise<{ success: boolean }>;
  onRefresh?: () => void;
}

// Захиалгын статусын өнгө
const getOrderStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "preparing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "serving":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "reserved":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Захиалгын статусын текст
const getOrderStatusText = (status: string) => {
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
    case "reserved":
      return "Захиалгатай";
    default:
      return status;
  }
};

// Цагийн форматыг харуулах
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("mn-MN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// Огнооны форматыг харуулах
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("mn-MN", {
    day: "2-digit",
    month: "short",
  });
};

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
}: TableCardProps) {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [printDevice, setPrintDevice] = useState("browser");
  const [copyCount, setCopyCount] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);

  // Дараагийн төлөв тодорхойлох
  const getNextStatus = (current: Order["status"]) => {
    switch (current) {
      case "pending":
        return "preparing" as const;
      case "preparing":
        return "serving" as const;
      case "serving":
        return "completed" as const;
      default:
        return current;
    }
  };

  // Товчны нэршил
  const getPrimaryActionLabel = (current?: Order["status"]) => {
    if (!current) return "Төлөв өөрчлөх";
    if (current === "pending") return "Захиалга хэвлэх";
    if (current === "preparing") return "Хоол гаргах";
    if (current === "serving") return "Дуусгах";
    return "Төлөв өөрчлөх";
  };

  // Статус шинэчлэх API дуудах
  const requestUpdateStatus = async (
    orderId: string,
    status: Order["status"]
  ) => {
    const res = await fetch(`${API_CONFIG.BACKEND_URL}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      console.error("Захиалгын статус шинэчлэхэд алдаа гарлаа");
    }
    return res.ok;
  };

  // pending үед хэвлэх modal нээх, бусад үед зөвхөн статус солих
  const handleAdvanceStatus = async () => {
    if (!table.currentOrder) return;
    if (isUpdating) return;

    const current = table.currentOrder.status;

    if (current === "pending") {
      // pending үед хэвлэх modal нээх
      setShowPrintModal(true);
    } else {
      // Бусад төлөвүүдэд зөвхөн статус солих
      setIsUpdating(true);
      try {
        const next = getNextStatus(current);
        await requestUpdateStatus(table.currentOrder._id, next);
        console.log("Статус шинэчлэгдлээ →", next);
        // UI шинэчлэх
        onRefresh?.();
      } catch (e) {
        console.error(e);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Принт функцийг дуудах
  const handlePrint = async () => {
    if (!table.currentOrder) return;

    if (printDevice === "browser") {
      // Браузер хэвлэх - шинэ page нээхгүй
      const printContent = generatePrintContent(table.currentOrder, table);
      const printFrame = document.createElement("iframe");
      printFrame.style.display = "none";
      document.body.appendChild(printFrame);

      const frameDoc =
        printFrame.contentDocument || printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.write(printContent);
        frameDoc.close();
        printFrame.contentWindow?.print();
      }

      // Print frame-ийг цэвэрлэх
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }

    // Хэвлэх үед статусыг preparing болгох
    if (table.currentOrder.status === "pending") {
      setIsUpdating(true);
      try {
        await requestUpdateStatus(table.currentOrder._id, "preparing");
        console.log("Статус шинэчлэгдлээ → preparing");
        // UI шинэчлэх
        onRefresh?.();
      } catch (e) {
        console.error(e);
      } finally {
        setIsUpdating(false);
      }
    }

    setShowPrintModal(false);
  };

  // Хэвлэх контент үүсгэх
  const generatePrintContent = (order: Order, table: Table) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Захиалга #${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .order-info { margin-bottom: 20px; }
          .order-info div { margin: 5px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .total { font-weight: bold; margin-top: 20px; }
          .notes { margin-top: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Захиалга #${order.orderNumber}</h1>
        </div>
        
        <div class="order-info">
          <div><strong>Ширээний дугаар:</strong> ${table.number}</div>
          <div><strong>Огноо:</strong> ${formatDate(order.createdAt)}</div>
          <div><strong>Цаг:</strong> ${formatTime(order.createdAt)}</div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Захиалсан хоол</th>
              <th>Япон нэр</th>
              <th>Тоо хэмжээ</th>
              <th>Үнэ</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${
                  item.menuItem
                    ? item.menuItem.nameMn || item.menuItem.name
                    : "Unknown Item"
                }</td>
                <td>${
                  item.menuItem ? item.menuItem.nameJp || "日本語名なし" : "N/A"
                }</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        ${
          order.items.some((item) => item.specialInstructions)
            ? `
          <div class="notes">
            <strong>Тэмдэглэл:</strong><br>
            ${order.items
              .map((item) => item.specialInstructions)
              .filter(Boolean)
              .join(", ")}
          </div>
        `
            : ""
        }
        
        <div class="total">
          <strong>Нийт дүн: $${order.total.toLocaleString()}</strong>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <>
      <Card
        className={`w-72 h-auto transition-all duration-200 hover:shadow-md pt-2 pb-0 gap-0 flex flex-col px-0 border-gray-200 bg-white ${
          table.currentOrder && table.currentReservation
            ? "border-purple-200" // Both exist
            : table.currentOrder
            ? "border-green-200" // Only order
            : table.currentReservation
            ? "border-blue-200" // Only reservation
            : table.status === "reserved"
            ? "border-red-200" // Reserved but no current data
            : "border-red-200" // Empty - changed to red
        }`}
      >
        {/* Table header - at the very top */}
        <div className="px-6 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Ширээ {table.number}</p>
            <div className="flex gap-2">
              {table.currentOrder && (
                <Badge
                  className={`text-xs ${getOrderStatusColor(
                    table.currentOrder.status
                  )}`}
                >
                  {getOrderStatusText(table.currentOrder.status)}
                </Badge>
              )}
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
              className="h-full p-0 m-0 space-y-2 bg-blue-50"
            >
              {/* Захиалгын мэдээлэл */}
              {table.currentOrder && (
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
                    {(() => {
                      // Log warning for debugging
                      const invalidItems = table.currentOrder.items.filter(
                        (item) => !item.menuItem
                      );
                      if (invalidItems.length > 0) {
                      }

                      return table.currentOrder.items
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
                            <div className="text-lg font-bold">
                              {item.quantity}
                            </div>
                          </div>
                        ));
                    })()}
                  </div>

                  {/* Нийт мөнгө */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-medium text-gray-700">
                      Нийт:
                    </span>
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
                          onClick={handleAdvanceStatus}
                          disabled={isUpdating}
                        >
                          {getPrimaryActionLabel(table.currentOrder.status)}
                        </Button>
                      )}
                    <Button
                      size="sm"
                      className="flex-1 text-black bg-red-100 hover:bg-red-200"
                      onClick={() => onCancelOrder?.(table.currentOrder!._id)}
                      disabled={isUpdating}
                    >
                      Цуцлах
                    </Button>
                  </div>
                </div>
              )}

              {/* Хоосон ширээний үйлдлийн товчнууд */}
              {!table.currentOrder && (
                <div className="flex gap-2 pt-4 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowCreateOrderModal(true)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Захиалга үүсгэх
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Reservations Tab */}
            <TabsContent
              value="reservations"
              className="h-full p-0 m-0 space-y-2 rounded-b-lg bg-red-50"
            >
              {(() => {
                // Өнөөдрийн огноог UTC+8 timezone-тай болгож авах (Mongolia timezone)
                const now = new Date();
                const utc8Date = new Date(now.getTime() + 8 * 60 * 60 * 1000); // UTC+8
                const todayString = utc8Date.toISOString().split("T")[0]; // YYYY-MM-DD формат

                // Зөвхөн өнөөдрийн огноотой захиалгыг шалгах
                const isTodayReservation =
                  table.currentReservation &&
                  table.currentReservation.date === todayString;

                return isTodayReservation ? (
                  // Reservation exists and is today
                  <div className="h-full p-3 m-0 space-y-2 bg-red-50">
                    {/* Reservation header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-700">
                        Захиалга #{table.currentReservation.reservationNumber}
                      </span>
                      <Badge className="text-xs text-blue-800 bg-blue-100 border-blue-200">
                        {table.currentReservation.status === "pending"
                          ? "Хүлээгдэж буй"
                          : table.currentReservation.status === "confirmed"
                          ? "Баталгаажсан"
                          : table.currentReservation.status === "seated"
                          ? "Сууж байна"
                          : table.currentReservation.status === "completed"
                          ? "Дууссан"
                          : table.currentReservation.status === "cancelled"
                          ? "Цуцлагдсан"
                          : table.currentReservation.status === "no-show"
                          ? "Ирээгүй"
                          : table.currentReservation.status}
                      </Badge>
                    </div>

                    {/* Customer info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Захиалагч:</span>
                        {table.currentReservation.customerName}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Утас:</span>
                        <span className="font-medium">
                          {table.currentReservation.customerPhone}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Огноо:</span>
                        <span className="font-medium">
                          {formatDate(table.currentReservation.date)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Цаг:</span>
                        <span className="font-medium">
                          {table.currentReservation.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Хүний тоо:</span>
                        <span className="font-medium">
                          {table.currentReservation.partySize} хүн
                        </span>
                      </div>
                      {table.currentReservation.specialRequests && (
                        <div className="pt-1 border-t border-gray-200">
                          <div className="mb-1 text-xs text-gray-600">
                            Тусгай хүсэлт:
                          </div>
                          <div className="p-2 text-xs italic text-blue-600 rounded bg-blue-50">
                            {table.currentReservation.specialRequests}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reservation actions */}
                    <div className="flex gap-1 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 text-black bg-blue-100 hover:bg-blue-200"
                        onClick={() => {
                          // Handle reservation status update
                          console.log("Update reservation status");
                        }}
                      >
                        Статус өөрчлөх
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Handle edit reservation
                          console.log("Edit reservation");
                        }}
                      >
                        Засах
                      </Button>
                    </div>
                  </div>
                ) : (
                  // No reservation or not today
                  <div className="py-4 text-center text-gray-500">
                    <div className="text-sm">
                      {table.currentReservation
                        ? "Өнөөдөр ширээ захиалга байхгүй"
                        : "No reservation"}
                    </div>
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Хэвлэх Modal */}
      <Dialog open={showPrintModal} onOpenChange={setShowPrintModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Захиалга хэвлэх</DialogTitle>
          </DialogHeader>

          {table.currentOrder && (
            <div className="space-y-4">
              {/* Захиалгын мэдээлэл */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Захиалгын дугаар:</span>
                  <span className="text-sm">
                    #{table.currentOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ширээний дугаар:</span>
                  <span className="text-sm font-bold">{table.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Огноо:</span>
                  <span className="text-lg">
                    {formatDate(table.currentOrder.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Цаг:</span>
                  <span className="text-lg font-bold">
                    {formatTime(table.currentOrder.createdAt)}
                  </span>
                </div>
              </div>

              {/* Захиалсан хоолнууд */}
              <div>
                <h4 className="mb-2 font-medium">Захиалсан хоол:</h4>
                <div className="space-y-2">
                  {table.currentOrder.items
                    .filter((item) => item.menuItem) // Only show items with valid menuItem
                    .map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <div className="text-lg font-bold">
                            {item.menuItem?.nameMn ||
                              item.menuItem?.name ||
                              "Unknown Item"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.menuItem?.nameJp || "日本語名なし"}
                          </div>
                        </div>
                        <div className="font-bold">{item.quantity}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Тэмдэглэл */}
              {table.currentOrder.items.some(
                (item) => item.specialInstructions
              ) && (
                <div>
                  <h4 className="mb-2 font-medium">Тэмдэглэл:</h4>
                  <p className="text-sm text-gray-600">
                    {table.currentOrder.items
                      .map((item) => item.specialInstructions)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}

              {/* Нийт дүн */}
              <div className="flex justify-between font-bold">
                <span>Нийт дүн:</span>
                <span>$ {table.currentOrder.total.toLocaleString()}</span>
              </div>

              {/* Хэвлэх тохиргоо */}
              <div className="pt-4 space-y-3 border-t">
                <div>
                  <Label htmlFor="print-device" className="text-sm font-medium">
                    Хэвлэх төхөөрөмж:
                  </Label>
                  <Select value={printDevice} onValueChange={setPrintDevice}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="browser">Браузер хэвлэх</SelectItem>
                      <SelectItem value="thermal">Термал принтер</SelectItem>
                      <SelectItem value="network">Сүлжээний принтер</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="copy-count" className="text-sm font-medium">
                    Хэвлэх тоо:
                  </Label>
                  <Input
                    id="copy-count"
                    type="number"
                    min="1"
                    max="10"
                    value={copyCount}
                    onChange={(e) =>
                      setCopyCount(parseInt(e.target.value) || 1)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Үйлдлийн товчнууд */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPrintModal(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Цуцлах
                </Button>
                <Button
                  className="flex-1 bg-black hover:bg-gray-800"
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Хэвлэх ({copyCount} хувь)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

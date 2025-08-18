"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TablesGrid } from "./tables-grid";
import { TableCardSkeleton } from "./table-card-skeleton";
import { ReservationModal } from "./reservation-modal";
import { QRModal } from "./qr-modal";
import { API_CONFIG } from "@/config/api";
import {
  RefreshCw,
  Grid,
  List,
  Clock,
  DollarSign,
  Users,
  Plus,
} from "lucide-react";
import { useState } from "react";

// Захиалгын item интерфейс
interface OrderItem {
  menuItem: {
    name: string;
    nameEn: string;
    nameMn?: string;
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

// Ширээний интерфейс
interface Table {
  _id: string;
  number: number;
  capacity: number;
  status: "empty" | "reserved";
  location: "main-hall" | "terrace";
  qrCode?: string;
  currentOrder?: Order;
  currentReservation?: any;
  currentReservations?: any[]; // Array of all reservations for this table
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

// Table Layout Props
interface TableLayoutProps {
  tables: Table[];
  menuItems: MenuItem[];
  reservations: any[];
  loading?: boolean;
  onStatusChange?: (tableId: string, status: "empty" | "reserved") => void;
  onViewQR?: (tableId: string) => void;
  onRefresh?: () => void;
  onCompleteOrder?: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  onPrintOrder?: (orderId: string) => void;
  onCreateOrder?: (orderData: {
    tableId: string;
    items: any[];
    total: number;
  }) => Promise<{ success: boolean }>;
}

export function TableLayout({
  tables,
  menuItems,
  reservations,
  loading = false,
  onStatusChange,
  onViewQR,
  onRefresh,
  onCompleteOrder,
  onCancelOrder,
  onPrintOrder,
  onCreateOrder,
}: TableLayoutProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any>(null);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<string>("");
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(0);

  // Статистик тооцоолох
  const stats = {
    totalTables: tables.length,
    emptyTables: tables.filter(
      (t) => t.status === "empty" && !t.currentOrder && !t.currentReservation
    ).length,
    reservedTables: tables.filter((t) => t.currentReservation).length,
    orderTables: tables.filter((t) => t.currentOrder).length,
    bothOrderAndReservation: tables.filter(
      (t) => t.currentOrder && t.currentReservation
    ).length,
    pendingOrders: tables.filter((t) => t.currentOrder?.status === "pending")
      .length,
    preparingOrders: tables.filter(
      (t) => t.currentOrder?.status === "preparing"
    ).length,
    totalRevenue: tables
      .filter((t) => t.currentOrder)
      .reduce((sum, t) => sum + (t.currentOrder?.total || 0), 0),
  };

  return (
    <div className="space-y-8 w-full">
      {/* Гарчиг */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Захиалгын удирдлага
          </h1>
          <p className="mt-1 text-gray-600">
            Бүх ширээний мэдээлэл болон захиалгын статус
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>
          {viewMode === "list" && (
            <Button
              onClick={() => {
                setEditingReservation(null);
                setSelectedTableId("");
                setShowReservationModal(true);
              }}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Reservation
            </Button>
          )}
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Шинэчлэх
          </Button>
        </div>
      </div>

      {/* Статистик картууд */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="gap-2 p-2 h-18">
          <div className="flex items-center justify-between mb-0">
            <span className="text-sm font-medium text-gray-600">
              Нийт ширээ
            </span>
            <Users className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold leading-tight">
              {stats.totalTables}
            </div>
            <p className="text-xs leading-tight text-gray-500">
              {stats.emptyTables} хоосон, {stats.reservedTables} захиалгатай
            </p>
          </div>
        </Card>

        <Card className="gap-2 p-2 h-18 ">
          <div className="flex items-center justify-between mb-0">
            <span className="text-xs font-medium text-gray-600">Захиалга</span>
            <Clock className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold leading-tight text-blue-600">
              {stats.orderTables}
            </div>
            <p className="text-xs leading-tight text-gray-500">
              {stats.bothOrderAndReservation} давхар, {stats.pendingOrders}{" "}
              хүлээгдэж
            </p>
          </div>
        </Card>

        <Card className="gap-2 p-2 h-18 ">
          <div className="flex items-center justify-between mb-0">
            <span className="text-xs font-medium text-gray-600">
              Нийт орлого
            </span>
            <DollarSign className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold leading-tight text-green-600">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs leading-tight text-gray-500">
              Өнөөдрийн захиалгууд
            </p>
          </div>
        </Card>

        <Card className="gap-2 p-2 h-18 ">
          <div className="flex items-center justify-between mb-0">
            <span className="text-xs font-medium text-gray-600">Хэрэглээ</span>
            <Grid className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold leading-tight">
              {Math.round(
                ((stats.orderTables + stats.reservedTables) /
                  stats.totalTables) *
                  100
              )}
              %
            </div>
            <p className="text-xs leading-tight text-gray-500">
              Ширээний ашиглалт
            </p>
          </div>
        </Card>
      </div>

      {/* Ширээний grid */}
      {viewMode === "grid" ? (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <TableCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <TablesGrid
            tables={tables}
            menuItems={menuItems}
            reservations={reservations}
            onStatusChange={onStatusChange}
            onViewQR={onViewQR}
            onCompleteOrder={onCompleteOrder}
            onCancelOrder={onCancelOrder}
            onPrintOrder={onPrintOrder}
            onCreateOrder={onCreateOrder}
            onRefresh={onRefresh}
          />
        )
      ) : (
        <div className="space-y-4">
          {tables.map((table) => (
            <Card key={table._id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold">
                    Ширээ {table.number}
                  </div>
                  <Badge
                    className={
                      table.status === "empty"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {table.status === "empty" ? "Хоосон" : "Захиалгатай"}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {table.location === "main-hall"
                      ? "Үндсэн танхим"
                      : "Террас"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (table.qrCode) {
                        setSelectedQRCode(table.qrCode);
                        setSelectedTableNumber(table.number);
                        setShowQRModal(true);
                      } else {
                        alert("Энэ ширээнд QR код байхгүй байна");
                      }
                    }}
                  >
                    QR код
                  </Button>
                </div>
              </div>
              {table.currentOrder && (
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-700">
                      Захиалга #{table.currentOrder.orderNumber}
                    </span>
                    <Badge className="text-xs bg-green-100 text-green-800">
                      {table.currentOrder.status === "pending"
                        ? "Хүлээгдэж буй"
                        : table.currentOrder.status === "preparing"
                        ? "Бэлтгэж буй"
                        : table.currentOrder.status === "serving"
                        ? "Хооллож буй"
                        : table.currentOrder.status === "completed"
                        ? "Дууссан"
                        : table.currentOrder.status === "cancelled"
                        ? "Цуцлагдсан"
                        : "Захиалгатай"}
                    </Badge>
                    <span className="text-green-700">
                      Нийт: ¥{table.currentOrder.total.toLocaleString()}
                    </span>
                    {table.currentOrder.customerName && (
                      <span className="text-green-700">
                        Хэрэглэгч: {table.currentOrder.customerName}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Reservation display in list view - show today and future reservations */}
              {(() => {
                // Өнөөдрийн огноог UTC+8 timezone-тай болгож авах (Mongolia timezone)
                const now = new Date();
                const utc8Date = new Date(now.getTime() + 8 * 60 * 60 * 1000); // UTC+8
                const todayString = utc8Date.toISOString().split("T")[0]; // YYYY-MM-DD формат

                // Өнөөдөр болон түүнээс хойших захиалгуудыг шүүх
                const todayAndFutureReservations = (
                  table.currentReservations || [table.currentReservation]
                ).filter((res: any) => res && res.date >= todayString);

                return todayAndFutureReservations.length > 0 ? (
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="space-y-2">
                      {todayAndFutureReservations.map(
                        (reservation: any, index: number) => (
                          <div
                            key={reservation._id || index}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-blue-700">
                                Захиалга #{reservation.reservationNumber}
                              </span>
                              <Badge className="text-xs bg-blue-100 text-blue-800">
                                {reservation.status === "pending"
                                  ? "Хүлээгдэж буй"
                                  : reservation.status === "confirmed"
                                  ? "Баталгаажсан"
                                  : reservation.status === "seated"
                                  ? "Сууж байна"
                                  : reservation.status === "completed"
                                  ? "Дууссан"
                                  : reservation.status === "cancelled"
                                  ? "Цуцлагдсан"
                                  : reservation.status === "no-show"
                                  ? "Ирээгүй"
                                  : reservation.status}
                              </Badge>
                              <span className="text-blue-700">
                                {reservation.date} at {reservation.time}
                              </span>
                              <span className="text-blue-700">
                                {reservation.partySize} хүн
                              </span>
                              <span className="text-blue-700">
                                {reservation.customerName}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => {
                                  setEditingReservation(reservation);
                                  setSelectedTableId(table._id);
                                  setShowReservationModal(true);
                                }}
                              >
                                Засах
                              </Button>
                              {reservation.status !== "cancelled" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs text-orange-600 hover:text-orange-700"
                                  onClick={async () => {
                                    if (
                                      confirm(
                                        "Энэ захиалгыг цуцлахдаа итгэлтэй байна уу?"
                                      )
                                    ) {
                                      try {
                                        const response = await fetch(
                                          `${API_CONFIG.BACKEND_URL}/api/reservations/${reservation._id}`,
                                          {
                                            method: "DELETE",
                                          }
                                        );
                                        const result = await response.json();
                                        if (result.success) {
                                          console.log(
                                            "Reservation cancelled successfully"
                                          );
                                          onRefresh?.();
                                        } else {
                                          console.error(
                                            "Failed to cancel reservation:",
                                            result.error
                                          );
                                          alert(
                                            "Failed to cancel reservation: " +
                                              result.error
                                          );
                                        }
                                      } catch (error) {
                                        console.error(
                                          "Error cancelling reservation:",
                                          error
                                        );
                                        alert("Error cancelling reservation");
                                      }
                                    }
                                  }}
                                >
                                  Цуцлах
                                </Button>
                              )}
                              {(reservation.status === "seated" ||
                                reservation.status === "cancelled") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs text-red-600 hover:text-red-700"
                                  onClick={async () => {
                                    if (
                                      confirm(
                                        "Энэ захиалгыг устгахдаа итгэлтэй байна уу?"
                                      )
                                    ) {
                                      try {
                                        const response = await fetch(
                                          `${API_CONFIG.BACKEND_URL}/api/reservations/${reservation._id}/delete`,
                                          {
                                            method: "DELETE",
                                          }
                                        );
                                        const result = await response.json();
                                        if (result.success) {
                                          console.log(
                                            "Reservation deleted successfully"
                                          );
                                          onRefresh?.();
                                        } else {
                                          console.error(
                                            "Failed to delete reservation:",
                                            result.error
                                          );
                                          alert(
                                            "Failed to delete reservation: " +
                                              result.error
                                          );
                                        }
                                      } catch (error) {
                                        console.error(
                                          "Error deleting reservation:",
                                          error
                                        );
                                        alert("Error deleting reservation");
                                      }
                                    }
                                  }}
                                >
                                  Устгах
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : null;
              })()}
            </Card>
          ))}
        </div>
      )}

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => {
          setShowReservationModal(false);
          setEditingReservation(null);
          setSelectedTableId("");
        }}
        onSubmit={async (data) => {
          try {
            if (editingReservation) {
              // Update existing reservation
              const response = await fetch(
                `${API_CONFIG.BACKEND_URL}/api/reservations/${editingReservation._id}`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                }
              );
              const result = await response.json();
              if (result.success) {
                console.log("Reservation updated successfully");
              } else {
                console.error("Failed to update reservation:", result.error);
                return { success: false, error: result.error };
              }
            } else {
              // Create new reservation
              const response = await fetch(
                `${API_CONFIG.BACKEND_URL}/api/reservations`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                }
              );
              const result = await response.json();
              if (result.success) {
                console.log("Reservation created successfully");
              } else {
                console.error("Failed to create reservation:", result.error);
                return { success: false, error: result.error };
              }
            }
            setShowReservationModal(false);
            setEditingReservation(null);
            setSelectedTableId("");
            onRefresh?.();
            return { success: true };
          } catch (error) {
            console.error("Error handling reservation:", error);
            return { success: false };
          }
        }}
        tables={tables}
        editingReservation={editingReservation}
        selectedTableId={selectedTableId}
      />

      {/* QR Modal */}
      <QRModal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedQRCode("");
          setSelectedTableNumber(0);
        }}
        qrCode={selectedQRCode}
        tableNumber={selectedTableNumber}
      />
    </div>
  );
}

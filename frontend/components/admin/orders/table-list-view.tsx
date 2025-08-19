"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_CONFIG } from "@/config/api";
import { Table } from "../types/table-layout.type";

interface TableListViewProps {
  tables: Table[];
  onRefresh?: () => void;
  onEditReservation: (reservation: any, tableId: string) => void;
  onViewQR: (qrCode: string, tableNumber: number) => void;
}

export function TableListView({
  tables,
  onRefresh,
  onEditReservation,
  onViewQR,
}: TableListViewProps) {
  const handleCancelReservation = async (reservation: any) => {
    if (confirm("Энэ захиалгыг цуцлахдаа итгэлтэй байна уу?")) {
      try {
        const response = await fetch(
          `${API_CONFIG.BACKEND_URL}/api/reservations/${reservation._id}`,
          {
            method: "DELETE",
          }
        );
        const result = await response.json();
        if (result.success) {
          console.log("Reservation cancelled successfully");
          onRefresh?.();
        } else {
          console.error("Failed to cancel reservation:", result.error);
          alert("Failed to cancel reservation: " + result.error);
        }
      } catch (error) {
        console.error("Error cancelling reservation:", error);
        alert("Error cancelling reservation");
      }
    }
  };

  const handleDeleteReservation = async (reservation: any) => {
    if (confirm("Энэ захиалгыг устгахдаа итгэлтэй байна уу?")) {
      try {
        const response = await fetch(
          `${API_CONFIG.BACKEND_URL}/api/reservations/${reservation._id}/delete`,
          {
            method: "DELETE",
          }
        );
        const result = await response.json();
        if (result.success) {
          console.log("Reservation deleted successfully");
          onRefresh?.();
        } else {
          console.error("Failed to delete reservation:", result.error);
          alert("Failed to delete reservation: " + result.error);
        }
      } catch (error) {
        console.error("Error deleting reservation:", error);
        alert("Error deleting reservation");
      }
    }
  };

  return (
    <div className="space-y-4">
      {tables.map((table) => (
        <Card key={table._id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-lg font-semibold">Ширээ {table.number}</div>
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
                {table.location === "main-hall" ? "Үндсэн танхим" : "Террас"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (table.qrCode) {
                    onViewQR(table.qrCode, table.number);
                  } else {
                    alert("Энэ ширээнд QR код байхгүй байна");
                  }
                }}
              >
                QR код
              </Button>
            </div>
          </div>

          {/* Order Display */}
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

          {/* Reservation Display */}
          {(() => {
            const now = new Date();
            const utc8Date = new Date(now.getTime() + 8 * 60 * 60 * 1000);
            const todayString = utc8Date.toISOString().split("T")[0];

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
                            onClick={() =>
                              onEditReservation(reservation, table._id)
                            }
                          >
                            Засах
                          </Button>
                          {reservation.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-orange-600 hover:text-orange-700"
                              onClick={() =>
                                handleCancelReservation(reservation)
                              }
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
                              onClick={() =>
                                handleDeleteReservation(reservation)
                              }
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
  );
}

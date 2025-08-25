"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reservation, Table } from "../types";
import { formatDate } from "../utils";

interface ReservationTabProps {
  table: Table;
  onEditReservation?: (reservation: any, tableId: string) => void;
  onReservationStatusChange?: (
    reservationId: string,
    newStatus: string
  ) => void;
  allReservations?: any[]; // Бүх reservation-ууд дараагийн харуулахад хэрэг
}

export function ReservationTab({
  table,
  onEditReservation,
  onReservationStatusChange,
  allReservations = [],
}: ReservationTabProps) {
  // Өнөөдрийн огноог UTC+8 timezone-тай болгож авах (Mongolia timezone)
  const now = new Date();
  const utc8Date = new Date(now.getTime() + 8 * 60 * 60 * 1000); // UTC+8
  const todayString = utc8Date.toISOString().split("T")[0]; // YYYY-MM-DD формат

  // Дараагийн reservation олох логик
  const getDisplayReservation = () => {
    // Хэрэв одоогийн reservation pending төлөвт байвал түүнийг харуулах
    if (
      table.currentReservation &&
      table.currentReservation.status === "pending" &&
      table.currentReservation.date === todayString
    ) {
      return table.currentReservation;
    }

    // Хэрэв confirmed эсвэл cancelled бол дараагийн reservation хайх
    if (
      table.currentReservation &&
      (table.currentReservation.status === "confirmed" ||
        table.currentReservation.status === "cancelled")
    ) {
      // Энэ ширээний өнөөдрийн дараагийн reservation хайх
      const todayReservations = allReservations
        .filter(
          (res) =>
            res.table?._id === table._id &&
            res.date === todayString &&
            res.status === "pending" &&
            res._id !== table.currentReservation?._id
        )
        .sort((a, b) => a.time.localeCompare(b.time));

      return todayReservations[0] || null;
    }

    return table.currentReservation;
  };

  const displayReservation = getDisplayReservation();

  // Зөвхөн өнөөдрийн огноотой захиалгыг шалгах
  const isTodayReservation =
    displayReservation && displayReservation.date === todayString;

  // Reservation статус өөрчлөх функц
  const handleStatusChange = () => {
    if (!displayReservation || !onReservationStatusChange) return;

    const currentStatus = displayReservation.status;
    let nextStatus = "";

    // Статусын дарааллын дагуу дараагийн статус тодорхойлох
    switch (currentStatus) {
      case "pending":
        nextStatus = "confirmed";
        break;
      default:
        return; // confirmed статусаас цааш өөрчлөхгүй
    }

    onReservationStatusChange(displayReservation._id, nextStatus);
  };

  // Дараагийн статусын текстийг авах
  const getNextStatusText = () => {
    if (!displayReservation) return "";

    const currentStatus = displayReservation.status;
    switch (currentStatus) {
      case "pending":
        return "Батлах";
      default:
        return "Батлагдсан"; // confirmed статусад товч идэвхгүй
    }
  };

  if (!isTodayReservation) {
    return (
      <div className="py-4 text-center text-gray-500">
        <div className="text-sm">Өнөөдөр ширээ захиалга байхгүй</div>
      </div>
    );
  }

  return (
    <div className="h-full p-3 m-0 space-y-2 bg-red-50">
      {/* Reservation header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-blue-700">
          Захиалга #{displayReservation!.reservationNumber}
        </span>
        <Badge className="text-xs text-blue-800 bg-blue-100 border-blue-200">
          {displayReservation!.status === "pending"
            ? "Хүлээгдэж буй"
            : displayReservation!.status === "confirmed"
            ? "Баталгаажсан"
            : displayReservation!.status === "seated"
            ? "Сууж байна"
            : displayReservation!.status === "completed"
            ? "Дууссан"
            : displayReservation!.status === "cancelled"
            ? "Цуцлагдсан"
            : displayReservation!.status === "no-show"
            ? "Ирээгүй"
            : displayReservation!.status}
        </Badge>
      </div>

      {/* Customer info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Захиалагч:</span>
          {displayReservation!.customerName}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Утас:</span>
          <span className="font-medium">
            {displayReservation!.customerPhone}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Огноо:</span>
          <span className="font-medium">
            {formatDate(displayReservation!.date)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Цаг:</span>
          <span className="font-medium">{displayReservation!.time}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Хүний тоо:</span>
          <span className="font-medium">
            {displayReservation!.partySize} хүн
          </span>
        </div>
        {displayReservation!.specialRequests && (
          <div className="pt-1 border-t border-gray-200">
            <div className="mb-1 text-xs text-gray-600">Тусгай хүсэлт:</div>
            <div className="p-2 text-xs italic text-blue-600 rounded bg-blue-50">
              {displayReservation!.specialRequests}
            </div>
          </div>
        )}
      </div>

      {/* Reservation actions */}
      <div className="flex gap-1 pt-2">
        <Button
          size="sm"
          className="flex-1 text-black bg-blue-100 hover:bg-blue-200"
          onClick={handleStatusChange}
          disabled={
            !displayReservation ||
            displayReservation.status === "confirmed" ||
            displayReservation.status === "completed" ||
            displayReservation.status === "cancelled" ||
            displayReservation.status === "no-show"
          }
        >
          {getNextStatusText()}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (onEditReservation && displayReservation) {
              onEditReservation(displayReservation, table._id);
            }
          }}
        >
          Засах
        </Button>
      </div>
    </div>
  );
}

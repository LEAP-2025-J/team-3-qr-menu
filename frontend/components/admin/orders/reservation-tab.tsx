"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reservation, Table } from "../types";
import { formatDate } from "../utils";

interface ReservationTabProps {
  table: Table;
}

export function ReservationTab({ table }: ReservationTabProps) {
  // Өнөөдрийн огноог UTC+8 timezone-тай болгож авах (Mongolia timezone)
  const now = new Date();
  const utc8Date = new Date(now.getTime() + 8 * 60 * 60 * 1000); // UTC+8
  const todayString = utc8Date.toISOString().split("T")[0]; // YYYY-MM-DD формат

  // Зөвхөн өнөөдрийн огноотой захиалгыг шалгах
  const isTodayReservation =
    table.currentReservation && table.currentReservation.date === todayString;

  if (!isTodayReservation) {
    return (
      <div className="py-4 text-center text-gray-500">
        <div className="text-sm">
          {table.currentReservation
            ? "Өнөөдөр ширээ захиалга байхгүй"
            : "No reservation"}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-3 m-0 space-y-2 bg-red-50">
      {/* Reservation header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-blue-700">
          Захиалга #{table.currentReservation!.reservationNumber}
        </span>
        <Badge className="text-xs text-blue-800 bg-blue-100 border-blue-200">
          {table.currentReservation!.status === "pending"
            ? "Хүлээгдэж буй"
            : table.currentReservation!.status === "confirmed"
            ? "Баталгаажсан"
            : table.currentReservation!.status === "seated"
            ? "Сууж байна"
            : table.currentReservation!.status === "completed"
            ? "Дууссан"
            : table.currentReservation!.status === "cancelled"
            ? "Цуцлагдсан"
            : table.currentReservation!.status === "no-show"
            ? "Ирээгүй"
            : table.currentReservation!.status}
        </Badge>
      </div>

      {/* Customer info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Захиалагч:</span>
          {table.currentReservation!.customerName}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Утас:</span>
          <span className="font-medium">
            {table.currentReservation!.customerPhone}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Огноо:</span>
          <span className="font-medium">
            {formatDate(table.currentReservation!.date)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Цаг:</span>
          <span className="font-medium">{table.currentReservation!.time}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Хүний тоо:</span>
          <span className="font-medium">
            {table.currentReservation!.partySize} хүн
          </span>
        </div>
        {table.currentReservation!.specialRequests && (
          <div className="pt-1 border-t border-gray-200">
            <div className="mb-1 text-xs text-gray-600">Тусгай хүсэлт:</div>
            <div className="p-2 text-xs italic text-blue-600 rounded bg-blue-50">
              {table.currentReservation!.specialRequests}
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
          }}
        >
          Статус өөрчлөх
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            // Handle edit reservation
          }}
        >
          Засах
        </Button>
      </div>
    </div>
  );
}

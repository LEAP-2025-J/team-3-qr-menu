"use client";

import { useState } from "react";
import { ReservationModal } from "./reservation-modal";
import { Building, Trees, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TablesGridProps } from "../types/tables-grid.type";
import {
  handleCreateReservation,
  groupTablesByLocation,
  getTableByNumber,
} from "./tables-grid-utils";
import { TableGridLeft } from "./table-grid-left";
import { TableGridRight } from "./table-grid-right";

export function TablesGrid({
  tables,
  menuItems,
  reservations,
  onStatusChange,
  onViewQR,
  onCompleteOrder,
  onCancelOrder,
  onPrintOrder,
  onCreateOrder,
  onRefresh,
  onEditReservation,
  onReservationStatusChange,
}: TablesGridProps) {
  const [showCreateReservationModal, setShowCreateReservationModal] =
    useState(false);

  // Байрлалаар бүлэглэх
  const groupedTables = groupTablesByLocation(tables);

  // Reservation үүсгэх wrapper функц
  const handleCreateReservationWrapper = async (reservationData: any) => {
    return await handleCreateReservation(reservationData, onRefresh);
  };

  return (
    <div className="space-y-8">
      {/* Байрлалын гарчиг */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <Building className="w-5 h-5" />
          <span>Үндсэн танхим</span>
          <span className="text-sm text-gray-500">
            ({groupedTables["main-hall"]?.length || 0} ширээ)
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateReservationModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Reservation
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </div>
      </div>

      {/* Ширээний grid - бодит байрлалд */}
      <div className="grid grid-cols-[auto_auto] gap-16 items-start">
        {/* Зүүн тал - 3 багана, контентын өндөр */}
        <TableGridLeft
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
          onEditReservation={onEditReservation}
          onReservationStatusChange={onReservationStatusChange}
        />

        {/* Баруун тал - 2 багана, контентын өндөр */}
        <TableGridRight
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
          onEditReservation={onEditReservation}
          onReservationStatusChange={onReservationStatusChange}
        />
      </div>

      {/* Add Reservation Modal */}
      <ReservationModal
        isOpen={showCreateReservationModal}
        onClose={() => setShowCreateReservationModal(false)}
        onSubmit={handleCreateReservationWrapper}
        tables={tables}
        existingReservations={reservations}
      />
    </div>
  );
}

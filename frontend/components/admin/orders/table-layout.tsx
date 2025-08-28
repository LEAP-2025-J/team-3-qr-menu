"use client";

import { useState } from "react";
import { TablesGrid } from "./tables-grid";
import { TableCardSkeleton } from "./table-card-skeleton";
import { ReservationModal } from "./reservation-modal";
import { QRModal } from "./qr-modal";
import { TableLayoutProps } from "../types/table-layout.type";
import { calculateTableStats, handleReservationSubmit } from "./table-utils";
import { TableHeader } from "./table-header";
import { TableStatsCards } from "./table-stats-cards";
import { TableListView } from "./table-list-view";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any>(null);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<string>("");
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(0);

  // Статистик тооцоолох
  const stats = calculateTableStats(tables);

  // Event handlers
  const handleAddReservation = () => {
    setEditingReservation(null);
    setSelectedTableId("");
    setShowReservationModal(true);
  };

  const handleEditReservation = (reservation: any, tableId: string) => {
    setEditingReservation(reservation);
    setSelectedTableId(tableId);
    setShowReservationModal(true);
  };

  const handleViewQR = (qrCode: string, tableNumber: number) => {
    setSelectedQRCode(qrCode);
    setSelectedTableNumber(tableNumber);
    setShowQRModal(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReservationStatusChange = async (
    reservationId: string,
    newStatus: string
  ) => {
    try {
      const API_CONFIG = (await import("@/config/api")).API_CONFIG;
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/reservations/${reservationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json();
      if (result.success) {
        await onRefresh(); // Refresh data
      }
    } catch (error) {
      // Алдаа гарвал зөндөө орхино
    }
  };

  const handleReservationSubmitWrapper = async (data: any) => {
    const result = await handleReservationSubmit(
      data,
      editingReservation,
      onRefresh
    );
    if (result.success) {
      setShowReservationModal(false);
      setEditingReservation(null);
      setSelectedTableId("");
    }
    return result;
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <TableHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddReservation={handleAddReservation}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Stats Cards */}
      <TableStatsCards stats={stats} />

      {/* Table View */}
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
            onEditReservation={handleEditReservation}
            onReservationStatusChange={handleReservationStatusChange}
          />
        )
      ) : (
        <TableListView
          tables={tables}
          onRefresh={onRefresh}
          onEditReservation={handleEditReservation}
          onViewQR={handleViewQR}
        />
      )}

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => {
          setShowReservationModal(false);
          setEditingReservation(null);
          setSelectedTableId("");
        }}
        onSubmit={handleReservationSubmitWrapper}
        tables={tables}
        editingReservation={editingReservation}
        selectedTableId={selectedTableId}
        onRefresh={onRefresh}
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

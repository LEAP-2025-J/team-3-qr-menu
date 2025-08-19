import { Table, TableStats } from "../types/table-layout.type";

// Статистик тооцоолох функц
export function calculateTableStats(tables: Table[]): TableStats {
  return {
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
}

// Reservation handler functions
export async function handleReservationSubmit(
  data: any,
  editingReservation: any,
  onRefresh?: () => void
): Promise<{ success: boolean; error?: string }> {
  try {
    const API_CONFIG = (await import("@/config/api")).API_CONFIG;

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
    onRefresh?.();
    return { success: true };
  } catch (error) {
    console.error("Error handling reservation:", error);
    return { success: false, error: "Unknown error occurred" };
  }
}

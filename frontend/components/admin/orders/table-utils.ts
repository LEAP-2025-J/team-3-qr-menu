import { Table, TableStats } from "../types/table-layout.type";
import { isReservationActive } from "../utils/date-utils";

// Өнөөдрийн огноотой захиалгыг шалгах функц
export function isOrderActive(order: any): boolean {
  if (!order || !order.createdAt) {
    return false;
  }

  // Өнөөдрийн огноог UTC+8 timezone-тай болгож авах (Mongolia timezone)
  const now = new Date();
  const utc8Date = new Date(now.getTime() + 8 * 60 * 60 * 1000); // UTC+8
  const todayString = utc8Date.toISOString().split("T")[0]; // YYYY-MM-DD формат

  // Захиалгын огноог шалгах
  const orderDate = new Date(order.createdAt);
  const orderDateString = orderDate.toISOString().split("T")[0]; // YYYY-MM-DD формат

  return orderDateString === todayString;
}

// Статистик тооцоолох функц
export function calculateTableStats(tables: Table[]): TableStats {
  // Өнөөдрийн идэвхтэй order-тай ширээнүүд
  const orderTables = tables.filter(
    (t) => t.currentOrder && isOrderActive(t.currentOrder)
  ).length;

  // Өнөөдрийн идэвхтэй reservation-тай ширээнүүд
  const reservedTables = tables.filter(
    (t) => t.currentReservation && isReservationActive(t.currentReservation)
  ).length;

  // Хоосон биш ширээний тоо = өнөөдрийн идэвхтэй order-той + өнөөдрийн идэвхтэй reservation-тай
  const nonEmptyTables = orderTables + reservedTables;

  // Хоосон ширээний тоо = нийт - хоосон биш
  const emptyTables = tables.length - nonEmptyTables;

  // Order болон reservation хоёулантай ширээнүүд (давхцал)
  const bothOrderAndReservation = tables.filter(
    (t) =>
      t.currentOrder &&
      isOrderActive(t.currentOrder) &&
      t.currentReservation &&
      isReservationActive(t.currentReservation)
  ).length;

  return {
    totalTables: tables.length,
    emptyTables: emptyTables,
    reservedTables: reservedTables,
    orderTables: orderTables, // Зөвхөн order-тай ширээнүүд
    bothOrderAndReservation: bothOrderAndReservation,
    pendingOrders: tables.filter(
      (t) =>
        t.currentOrder &&
        isOrderActive(t.currentOrder) &&
        t.currentOrder.status === "pending"
    ).length,
    preparingOrders: tables.filter(
      (t) =>
        t.currentOrder &&
        isOrderActive(t.currentOrder) &&
        t.currentOrder.status === "preparing"
    ).length,
    totalRevenue: tables
      .filter((t) => t.currentOrder && isOrderActive(t.currentOrder))
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

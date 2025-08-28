import { Table } from "../types/tables-grid.type";
import { API_CONFIG } from "@/config/api";

// Reservation үүсгэх функц
export async function handleCreateReservation(
  reservationData: any,
  onRefresh?: () => void
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData),
    });

    const result = await response.json();

    if (response.ok) {
      // Refresh tables to update currentReservation fields
      onRefresh?.();
      return { success: true, message: "Reservation created successfully!" };
    } else {
      return {
        success: false,
        error: result.message || "Failed to create reservation",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Error creating reservation",
    };
  }
}

// Байрлалаар бүлэглэх функц
export function groupTablesByLocation(
  tables: Table[]
): Record<string, Table[]> {
  return tables.reduce((acc, table) => {
    if (!acc[table.location]) {
      acc[table.location] = [];
    }
    acc[table.location].push(table);
    return acc;
  }, {} as Record<string, Table[]>);
}

// Ширээний дугаараар байрлуулах функц
export function getTableByNumber(
  tables: Table[],
  number: number
): Table | undefined {
  return tables.find((table) => table.number === number);
}

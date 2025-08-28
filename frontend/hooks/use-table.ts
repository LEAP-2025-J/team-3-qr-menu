import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG } from "@/config/api";

export function useTable(
  tableNumber: string | null,
  getText: (en: string, mn: string, ja: string) => string
) {
  const { toast } = useToast();
  const [tableAvailable, setTableAvailable] = useState<boolean | null>(null);

  // Check table status immediately
  const checkTableStatusImmediately = async (tableNum: string) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/tables?number=${tableNum}`
      );
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const table = data.data[0];

        // Захиалгатай ширээнд ч гэсэн дахин QR уншуулахад сагсанд хоол нэмж болдог болгох
        // Check if table is reserved
        if (table.status === "reserved") {
          setTableAvailable(true); // Захиалгатай ширээнд ч гэсэн true болгох
          // Toast болиулсан - захиалгатай ширээнд дахин QR уншуулахад toast гаргахгүй
        } else {
          setTableAvailable(true);
        }
      }
    } catch (error) {
      console.error("Error checking table status immediately:", error);
    }
  };

  // Check table status when table number changes
  useEffect(() => {
    if (tableNumber) {
      checkTableStatusImmediately(tableNumber);
    }
  }, [tableNumber]);

  return {
    tableAvailable,
    setTableAvailable,
    checkTableStatusImmediately,
  };
}

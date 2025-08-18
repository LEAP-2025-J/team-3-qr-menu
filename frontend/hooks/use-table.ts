import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG } from "@/config/api";

export function useTable(tableNumber: string | null, getText: (en: string, mn: string, ja: string) => string) {
  const { toast } = useToast();
  const [tableAvailable, setTableAvailable] = useState<boolean | null>(null);

  // Check table status immediately
  const checkTableStatusImmediately = async (tableNum: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/tables?number=${tableNum}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const table = data.data[0];

        // Check if table is reserved
        if (table.status === "reserved") {
          setTableAvailable(false);
          toast({
            title: getText("🚫 Table Occupied", "🚫 Ширээ захиалгатай", "🚫 テーブルは使用中"),
            description: getText(
              "This table has an active order. Please wait for the table to become available, or place your order at another available table. Thank you.",
              "Энэ ширээ идэвхтэй захиалгатай байна. Та ширээ сулрахыг хүлээнэ үү. Эсвэл өөр сул ширээнд захиалга өгнө үү. Баярлалаа",
              "このテーブルは使用中です。テーブルが空くまでお待ちいただくか、他の空いているテーブルでご注文ください。ありがとうございます。"
            ),
            variant: "destructive",
            duration: 8000,
          });
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
"use client";

import { useState } from "react";
import { TableCard } from "./table-card";
import { ReservationModal } from "./reservation-modal";
import { Building, Trees, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_CONFIG } from "@/config/api";

// Захиалгын item интерфейс
interface OrderItem {
  menuItem: {
    name: string;
    nameEn: string;
    nameMn?: string;
  };
  quantity: number;
  price: number;
  specialInstructions?: string;
}

// Захиалгын интерфейс
interface Order {
  _id: string;
  orderNumber: string;
  status:
    | "pending"
    | "preparing"
    | "serving"
    | "completed"
    | "cancelled"
    | "reserved";
  total: number;
  customerName?: string;
  estimatedTime?: number;
  items: OrderItem[];
  createdAt: string;
}

// Ширээний интерфейс
interface Table {
  _id: string;
  number: number;
  capacity: number;
  status: "empty" | "reserved";
  location: "main-hall" | "terrace";
  qrCode?: string;
  currentOrder?: Order;
  currentReservation?: any;
}

// Menu item интерфейс
interface MenuItem {
  _id: string;
  name: string;
  nameEn: string;
  nameMn?: string;
  nameJp?: string;
  description?: string;
  price: number;
  category: { name: string; nameEn: string; nameMn?: string };
  image?: string;
}

// Tables Grid Props
interface TablesGridProps {
  tables: Table[];
  menuItems: MenuItem[];
  reservations: any[];
  onStatusChange?: (tableId: string, status: "empty" | "reserved") => void;
  onViewQR?: (tableId: string) => void;
  onCompleteOrder?: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  onPrintOrder?: (orderId: string) => void;
  onCreateOrder?: (orderData: {
    tableId: string;
    items: any[];
    total: number;
  }) => Promise<{ success: boolean }>;
  onRefresh?: () => void;
}

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
}: TablesGridProps) {
  const [showCreateReservationModal, setShowCreateReservationModal] =
    useState(false);

  // Reservation үүсгэх функц
  const handleCreateReservation = async (reservationData: any) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/reservations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reservationData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("Reservation created successfully:", result);
        // Refresh tables to update currentReservation fields
        onRefresh?.();
        return { success: true, message: "Reservation created successfully!" };
      } else {
        console.error("Failed to create reservation:", result);
        return {
          success: false,
          error: result.message || "Failed to create reservation",
        };
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      return {
        success: false,
        error: "Error creating reservation",
      };
    }
  };

  // Байрлалаар бүлэглэх
  const groupedTables = tables.reduce((acc, table) => {
    if (!acc[table.location]) {
      acc[table.location] = [];
    }
    acc[table.location].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  // Ширээний дугаараар байрлуулах функц
  const getTableByNumber = (number: number) => {
    return tables.find((table) => table.number === number);
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
      <div className="flex gap-16">
        {/* Зүүн тал - 3 багана, контентын өндөр */}
        <div
          className="grid grid-cols-3 gap-12 auto-rows-auto"
          style={{ gridTemplateColumns: "repeat(3, minmax(260px, 300px))" }}
        >
          {/* Мөр 1: Ширээ 1, 2, 3 */}
          {getTableByNumber(1) && (
            <TableCard
              key={getTableByNumber(1)!._id}
              table={getTableByNumber(1)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}
          {getTableByNumber(2) && (
            <TableCard
              key={getTableByNumber(2)!._id}
              table={getTableByNumber(2)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}
          {getTableByNumber(3) && (
            <TableCard
              key={getTableByNumber(3)!._id}
              table={getTableByNumber(3)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}

          {/* Мөр 2: Ширээ 4, 5, 6 */}
          {getTableByNumber(4) && (
            <TableCard
              key={getTableByNumber(4)!._id}
              table={getTableByNumber(4)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}
          {getTableByNumber(5) && (
            <TableCard
              key={getTableByNumber(5)!._id}
              table={getTableByNumber(5)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}
          {getTableByNumber(6) && (
            <TableCard
              key={getTableByNumber(6)!._id}
              table={getTableByNumber(6)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}

          {/* Мөр 3: хоосон, хоосон, хоосон */}
          <div></div>
          <div></div>
          <div></div>

          {/* Мөр 4: "Террас", хоосон, хоосон */}
          <div className="flex items-center justify-center text-lg font-semibold text-gray-600 bg-gray-100 rounded-lg">
            <Trees className="w-5 h-5 mr-2" />
            <span>Террас</span>
            <span className="ml-2 text-sm text-gray-500">(5 ширээ)</span>
          </div>
          <div></div>
          <div></div>

          {/* Мөр 5: Ширээ 17, хоосон, хоосон */}
          {getTableByNumber(17) && (
            <TableCard
              key={getTableByNumber(17)!._id}
              table={getTableByNumber(17)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}
          <div></div>
          <div></div>

          {/* Мөр 6: Ширээ 19, Ширээ 18, хоосон */}
          {getTableByNumber(19) && (
            <TableCard
              key={getTableByNumber(19)!._id}
              table={getTableByNumber(19)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}
          {getTableByNumber(18) && (
            <TableCard
              key={getTableByNumber(18)!._id}
              table={getTableByNumber(18)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}
          <div></div>

          {/* Мөр 7: Ширээ 20, Ширээ 21, хоосон */}
          {getTableByNumber(20) && (
            <TableCard
              key={getTableByNumber(20)!._id}
              table={getTableByNumber(20)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}
          {getTableByNumber(21) && (
            <TableCard
              key={getTableByNumber(21)!._id}
              table={getTableByNumber(21)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}
          <div></div>
        </div>

        {/* Баруун тал - 2 багана, контентын өндөр */}
        <div
          className="grid grid-cols-2 gap-12 auto-rows-auto"
          style={{ gridTemplateColumns: "repeat(2, minmax(260px, 300px))" }}
        >
          {/* Мөр 1: Ширээ 7, Ширээ 8 */}
          {getTableByNumber(7) && (
            <TableCard
              key={getTableByNumber(7)!._id}
              table={getTableByNumber(7)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}
          {getTableByNumber(8) && (
            <TableCard
              key={getTableByNumber(8)!._id}
              table={getTableByNumber(8)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}

          {/* Мөр 2: хоосон, Ширээ 9 */}
          <div></div>
          {getTableByNumber(9) && (
            <TableCard
              key={getTableByNumber(9)!._id}
              table={getTableByNumber(9)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}

          {/* Мөр 3: хоосон, Ширээ 10 */}
          <div></div>
          {getTableByNumber(10) && (
            <TableCard
              key={getTableByNumber(10)!._id}
              table={getTableByNumber(10)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}

          {/* Мөр 4: хоосон, Ширээ 11 */}
          <div></div>
          {getTableByNumber(11) && (
            <TableCard
              key={getTableByNumber(11)!._id}
              table={getTableByNumber(11)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}

          {/* Мөр 5: Ширээ 15, Ширээ 12 */}
          {getTableByNumber(15) && (
            <TableCard
              key={getTableByNumber(15)!._id}
              table={getTableByNumber(15)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}
          {getTableByNumber(12) && (
            <TableCard
              key={getTableByNumber(12)!._id}
              table={getTableByNumber(12)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}

          {/* Мөр 6: хоосон, Ширээ 13 */}
          <div></div>
          {getTableByNumber(13) && (
            <TableCard
              key={getTableByNumber(13)!._id}
              table={getTableByNumber(13)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}

          {/* Мөр 7: Ширээ 16, Ширээ 14 */}
          {getTableByNumber(16) && (
            <TableCard
              key={getTableByNumber(16)!._id}
              table={getTableByNumber(16)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}
          {getTableByNumber(14) && (
            <TableCard
              key={getTableByNumber(14)!._id}
              table={getTableByNumber(14)!}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={onStatusChange}
              onViewQR={onViewQR}
              onCompleteOrder={onCompleteOrder}
              onCancelOrder={onCancelOrder}
              onPrintOrder={onPrintOrder}
              onCreateOrder={onCreateOrder}
              onRefresh={onRefresh}
            />
          )}
        </div>
      </div>

      {/* Add Reservation Modal */}
      <ReservationModal
        isOpen={showCreateReservationModal}
        onClose={() => setShowCreateReservationModal(false)}
        onSubmit={handleCreateReservation}
        tables={tables}
        existingReservations={reservations}
      />
    </div>
  );
}

import { Order, Reservation } from "./order-types";
import { MenuItem } from "./menu-types";

// Ширээний интерфейс
export interface Table {
  _id: string;
  number: number;
  capacity: number;
  status: "empty" | "reserved";
  location: "main-hall" | "terrace";
  qrCode?: string;
  currentOrder?: Order;
  currentReservation?: Reservation;
  currentReservations?: Reservation[]; // Array of all reservations for this table
}

// Table Card Props
export interface TableCardProps {
  table: Table;
  menuItems: MenuItem[];
  tables: Table[]; // Бүх ширээний жагсаалт
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
  onEditReservation?: (reservation: any, tableId: string) => void;
}

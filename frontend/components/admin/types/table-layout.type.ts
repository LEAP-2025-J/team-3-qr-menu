// Table Layout-д хэрэгтэй type definitions

export interface OrderItem {
  menuItem: {
    name: string;
    nameEn: string;
    nameMn?: string;
  };
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Order {
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

export interface Table {
  _id: string;
  number: number;
  capacity: number;
  status: "empty" | "reserved";
  location: "main-hall" | "terrace";
  qrCode?: string;
  currentOrder?: Order;
  orders?: Order[]; // Бүх захиалгын жагсаалт
  currentReservation?: any;
  currentReservations?: any[]; // Array of all reservations for this table
}

export interface MenuItem {
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

export interface TableLayoutProps {
  tables: Table[];
  menuItems: MenuItem[];
  reservations: any[];
  loading?: boolean;
  onStatusChange?: (tableId: string, status: "empty" | "reserved") => void;
  onViewQR?: (tableId: string) => void;
  onRefresh?: () => void;
  onCompleteOrder?: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  onPrintOrder?: (orderId: string) => void;
  onCreateOrder?: (orderData: {
    tableId: string;
    items: any[];
    total: number;
  }) => Promise<{ success: boolean }>;
  onEditReservation?: (reservation: any, tableId: string) => void;
}

export interface TableStats {
  totalTables: number;
  emptyTables: number;
  reservedTables: number;
  orderTables: number;
  bothOrderAndReservation: number;
  pendingOrders: number;
  preparingOrders: number;
  totalRevenue: number;
}

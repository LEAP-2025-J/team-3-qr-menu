import { useState, useEffect } from "react";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api";

// Types
export interface Order {
  _id: string;
  orderNumber: string;
  table: { number: number };
  items: Array<{
    menuItem: { name: string; nameEn: string; price: number };
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
}

export interface Table {
  _id: string;
  number: number;
  capacity: number;
  status: "empty" | "reserved";
  location: "main-hall" | "terrace";
  qrCode?: string;
  currentOrder?: {
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
    items: Array<{
      menuItem: { name: string; nameEn: string; nameMn?: string };
      quantity: number;
      price: number;
      specialInstructions?: string;
    }>;
    createdAt: string;
  };
  currentReservation?: {
    _id: string;
    reservationNumber: string;
    customerName: string;
    customerPhone: string;
    date: string;
    time: string;
    partySize: number;
    status: string;
    table?: { number: number };
  };
}

export interface Reservation {
  _id: string;
  reservationNumber: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
  status: string;
  table?: { number: number };
}

export interface MenuItem {
  _id: string;
  name: string;
  nameEn: string;
  nameMn: string;
  nameJp: string;
  description: string;
  descriptionEn: string;
  descriptionMn: string;
  descriptionJp: string;
  price: number;
  category: { name: string; nameEn: string };
  image?: string;
  isAvailable: boolean;
  preparationTime: number;
}

export interface Category {
  _id: string;
  name: string;
  nameEn: string;
  nameMn: string;
  description: string;
  order: number;
}

export interface AdminStats {
  todayOrders: number;
  activeReservations: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export function useAdminData() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    todayOrders: 0,
    activeReservations: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });

  // Fetch data functions
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ORDERS}?limit=20`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);

        // Calculate stats
        const today = new Date().toDateString();
        const todayOrders = data.data.filter(
          (order: Order) => new Date(order.createdAt).toDateString() === today
        );

        const totalRevenue = todayOrders.reduce(
          (sum: number, order: Order) => sum + order.total,
          0
        );
        const averageOrderValue =
          todayOrders.length > 0 ? totalRevenue / todayOrders.length : 0;

        setStats((prev) => ({
          ...prev,
          todayOrders: todayOrders.length,
          totalRevenue,
          averageOrderValue,
        }));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.TABLES}`);
      const data = await response.json();
      if (data.success) {
        // Get current reservations to populate currentReservation field
        const reservationsResponse = await fetch(
          `${API_ENDPOINTS.RESERVATIONS}?date=all&status=all`
        );
        const reservationsData = await reservationsResponse.json();

        let currentReservations: any[] = [];
        if (reservationsData.success) {
          currentReservations = reservationsData.data;
        }

        // Populate currentReservations field for each table (array of all reservations)
        const tablesWithReservations = data.data.map((table: any) => {
          // Find all reservations for this table
          const tableReservations = currentReservations.filter((res: any) => {
            // Convert both to strings for comparison
            const tableId = table._id.toString();
            let reservationTableId = "";

            if (res.table) {
              if (res.table._id) {
                reservationTableId = res.table._id.toString();
              } else if (typeof res.table === "string") {
                reservationTableId = res.table;
              } else if (res.table.toString) {
                reservationTableId = res.table.toString();
              }
            }

            const matches = reservationTableId === tableId;
            return matches;
          });

          return {
            ...table,
            currentReservations: tableReservations, // Array of all reservations
            currentReservation: tableReservations[0] || undefined, // Keep for backward compatibility
          };
        });

        setTables(tablesWithReservations);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.RESERVATIONS}?date=all&status=all`
      );
      const data = await response.json();
      if (data.success) {
        setReservations(data.data);
        setStats((prev) => ({
          ...prev,
          activeReservations: data.data.filter(
            (res: Reservation) =>
              res.status === "confirmed" || res.status === "pending"
          ).length,
        }));

        // Also refresh tables to update currentReservation fields
        fetchTables();
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.MENU}`);
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.data);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CATEGORIES}`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ORDERS}/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders(); // Refresh orders
        fetchTables(); // Refresh tables as they might be affected
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // Menu item functions
  const addMenuItem = async (menuData: any) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.MENU}`, {
        method: "POST",
        body: menuData, // FormData ашиглах
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        fetchMenuItems();
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.error || "Unknown error" };
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      return { success: false, message: "Error adding menu item" };
    }
  };

  const updateMenuItem = async (id: string, menuData: any) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.MENU}/${id}`, {
        method: "PUT",
        body: menuData,
      });

      if (response.ok) {
        const result = await response.json();
        fetchMenuItems();
        return { success: true, message: result.message };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || "Failed to update menu item",
        };
      }
    } catch (error) {
      console.error("Error updating menu item:", error);
      return { success: false, error: "Error updating menu item" };
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.MENU}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        fetchMenuItems();
        return { success: true, message: result.message };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || "Failed to delete menu item",
        };
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      return { success: false, error: "Error deleting menu item" };
    }
  };

  // Category functions
  const addCategory = async (categoryData: any) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CATEGORIES}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        fetchCategories();
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error("Error adding category:", error);
      return { success: false };
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOrders(),
        fetchTables(),
        fetchReservations(),
        fetchMenuItems(),
        fetchCategories(),
      ]);
      setLoading(false);
    };

    initializeData();

    // Polling механизмийг бүрэн зогсоох (refresh ажилладаг болгосны дараа)
    // const interval = setInterval(() => {
    //   fetchOrders();
    //   fetchTables();
    //   fetchReservations();
    // }, 30000); // 30 секунд

    // return () => clearInterval(interval);
  }, []);

  return {
    orders,
    tables,
    reservations,
    menuItems,
    categories,
    loading,
    stats,
    fetchOrders,
    fetchTables,
    fetchReservations,
    fetchMenuItems,
    fetchCategories,
    updateOrderStatus,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
  };
}

import { useState, useEffect } from "react";
import { API_CONFIG } from "@/config/api";

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
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/orders?limit=20`
      );
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
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/tables`);
      const data = await response.json();
      if (data.success) {
        setTables(data.data);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const fetchReservations = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/reservations?date=${today}`
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
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/menu`);
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
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/categories`);
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
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/orders/${orderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

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
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/menu`, {
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
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/menu/${id}`, {
        method: "PUT",
        body: menuData,
      });

      if (response.ok) {
        fetchMenuItems();
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error("Error updating menu item:", error);
      return { success: false };
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/menu/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMenuItems();
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      return { success: false };
    }
  };

  // Category functions
  const addCategory = async (categoryData: any) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/categories`, {
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

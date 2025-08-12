"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  StatsCardSkeleton,
  OrderRowSkeleton,
  AdminTabSkeleton,
  ReservationSkeleton,
  MenuManagementSkeleton,
} from "@/components/ui/loading-skeleton";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Calendar,
  MenuIcon,
  Settings,
  TrendingUp,
  Download,
  Bell,
  User,
  Plus,
  RefreshCw,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

// Import components
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RecentOrders } from "@/components/admin/recent-orders";
import { MenuGrid, MenuGridRef } from "@/components/admin/menu-grid";
import { OrdersList } from "@/components/admin/orders-list";
import { TablesGrid } from "@/components/admin/tables-grid";
import { ReservationsList } from "@/components/admin/reservations-list";
import { SettingsForm } from "@/components/admin/settings-form";
import { ReservationModal } from "@/components/admin/reservation-modal";
import { EditReservationModal } from "@/components/admin/edit-reservation-modal";

// Types
interface Order {
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

interface Table {
  _id: string;
  number: number;
  capacity: number;
  status: string;
  currentOrder?: { orderNumber: string; status: string; total: number };
}

interface Reservation {
  _id: string;
  reservationNumber: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
  status: string;
  table?: { number: number; _id: string };
  createdAt: string;
}

interface MenuItem {
  _id: string;
  name: string;
  nameEn: string;
  nameMn: string;
  description: string;
  price: number;
  category: { name: string; nameEn: string };
  image?: string;
  isAvailable: boolean;
  isSpicy: boolean;
  preparationTime: number;
}

interface Category {
  _id: string;
  name: string;
  nameEn: string;
  nameMn: string;
  description: string;
  order: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isEditReservationModalOpen, setIsEditReservationModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    nameEn: "",
    nameMn: "",
    description: "",
    order: 0,
  });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [stats, setStats] = useState({
    todayOrders: 0,
    activeReservations: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // MenuGrid ref
  const menuGridRef = useRef<MenuGridRef>(null);

  // Fetch data functions
  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/orders?limit=20");
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
      const response = await fetch("http://localhost:5000/api/tables");
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
      const response = await fetch("http://localhost:5000/api/reservations");
      const data = await response.json();
      if (data.success) {
        setReservations(data.data);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const checkAndCancelExpiredReservations = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(
        `http://localhost:5000/api/reservations?date=${today}`
      )
      const data = await response.json()
      
      if (data.success) {
        const now = new Date()
        const expiredReservations = data.data.filter((r: Reservation) => {
          if (r.status !== "pending") return false
          
          const reservationDateTime = new Date(`${r.date}T${r.time}`)
          const expiryTime = new Date(reservationDateTime.getTime() + 30 * 60 * 1000) // 30 minutes
          
          return now > expiryTime
        })

        // Cancel expired reservations
        for (const reservation of expiredReservations) {
          await fetch(`http://localhost:5000/api/reservations/${reservation._id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "cancelled" }),
          })

          // Update table status back to available
          if (reservation.table) {
            await fetch(`http://localhost:5000/api/tables/${reservation.table.number}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status: "available" }),
            })
          }
        }

        // Refresh data if any reservations were cancelled
        if (expiredReservations.length > 0) {
          fetchReservations()
          fetchTables()
        }
      }
    } catch (error) {
      console.error("Error checking expired reservations:", error)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/menu");
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
      const response = await fetch("http://localhost:5000/api/categories");
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
        `http://localhost:5000/api/orders/${orderId}`,
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
      const response = await fetch("http://localhost:5000/api/menu", {
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
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      return { success: false, error: "Бараа нэмэхэд алдаа гарлаа" };
    }
  };

  const updateMenuItem = async (id: string, menuData: any) => {
    try {
      const response = await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: "PUT",
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
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error updating menu item:", error);
      return { success: false, error: "Бараа засахад алдаа гарлаа" };
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        fetchMenuItems();
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      return { success: false, error: "Бараа устгахад алдаа гарлаа" };
    }
  };

  // Категори нэмэх функц
  const addCategory = async (categoryData: any) => {
    try {
      const response = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        fetchCategories();
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error adding category:", error);
      return { success: false, error: "Категори нэмэхэд алдаа гарлаа" };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchReservations(),
          fetchTables(),
          fetchMenuItems(),
          fetchCategories(),
          fetchOrders()
        ])
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Check for expired reservations every minute
  useEffect(() => {
    const interval = setInterval(checkAndCancelExpiredReservations, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "served":
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "occupied":
        return "bg-red-100 text-red-800 border-red-200";
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "reserved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cleaning":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparing":
        return <Clock className="w-4 h-4" />;
      case "ready":
        return <CheckCircle className="w-4 h-4" />;
      case "served":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  // Категори нэмэх modal handler-үүд
  const openCategoryModal = () => {
    setCategoryFormData({
      nameEn: "",
      nameMn: "",
      description: "",
      order: categories.length + 1,
    });
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setCategoryFormData({
      nameEn: "",
      nameMn: "",
      description: "",
      order: 0,
    });
  };

  const openReservationModal = () => {
    setIsReservationModalOpen(true);
  };

  const closeReservationModal = () => {
    setIsReservationModalOpen(false);
  };

  const openEditReservationModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsEditReservationModalOpen(true);
  };

  const closeEditReservationModal = () => {
    setIsEditReservationModalOpen(false);
    setSelectedReservation(null);
  };

  const handleEditReservation = async (id: string, data: any) => {
    try {
      // Convert tableId to table to match the backend model
      const { tableId, ...otherData } = data;
      const requestData = {
        ...otherData,
        table: tableId
      };

      const response = await fetch(`http://localhost:5000/api/reservations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh data
        fetchReservations();
        fetchTables();
        return { success: true, message: "Reservation updated successfully!" };
      } else {
        return { success: false, error: result.message || "Failed to update reservation" };
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      return { success: false, error: "Error updating reservation" };
    }
  };

  const handleDeleteReservation = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${id}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        // Refresh data
        fetchReservations();
        fetchTables();
        alert("Reservation deleted successfully!");
      } else {
        alert(result.error || "Failed to delete reservation");
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      alert("Error deleting reservation");
    }
  };

  const handleReservationSubmit = async (reservationData: any) => {
    try {
      // Convert tableId to table to match the backend model
      const { tableId, ...otherData } = reservationData;
      const requestData = {
        ...otherData,
        table: tableId
      };

      const response = await fetch("http://localhost:5000/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        // Update table status to reserved
        await fetch(`http://localhost:5000/api/tables/${tableId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "reserved" }),
        });

        // Refresh data
        fetchReservations();
        fetchTables();
        return { success: true, message: "Reservation created successfully!" };
      } else {
        return { success: false, error: data.message || "Failed to create reservation" };
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      return { success: false, error: "Error creating reservation" };
    }
  };

  const handleReservationStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        // If status changed to seated, update table status
        if (status === "seated") {
          const reservation = reservations.find(r => r._id === id);
          if (reservation?.table) {
            await fetch(`http://localhost:5000/api/tables/${reservation.table._id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status: "occupied" }),
            });
          }
        }
        
        fetchReservations();
        fetchTables();
      } else {
        alert("Failed to update reservation status");
      }
    } catch (error) {
      console.error("Error updating reservation status:", error);
      alert("Error updating reservation status");
    }
  };

  const handleReservationCancel = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        // Update table status back to available
        const reservation = reservations.find(r => r._id === id);
        if (reservation?.table) {
          await fetch(`http://localhost:5000/api/tables/${reservation.table._id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "available" }),
          });
        }
        
        fetchReservations();
        fetchTables();
      } else {
        alert("Failed to cancel reservation");
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert("Error cancelling reservation");
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryLoading(true);

    try {
      const result = await addCategory(categoryFormData);
      if (result.success) {
        alert(result.message || "Категори амжилттай нэмэгдлээ");
        closeCategoryModal();
      } else {
        alert(result.error || "Категори нэмэхэд алдаа гарлаа");
      }
    } catch (error) {
      alert("Категори нэмэхэд алдаа гарлаа");
    } finally {
      setCategoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Sakura Admin</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Sakura Admin</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <nav className="p-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              orientation="vertical"
              className="w-full"
            >
              <TabsList className="grid w-full h-auto grid-rows-6 bg-transparent">
                <TabsTrigger value="dashboard" className="justify-start w-full">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="orders" className="justify-start w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Orders (
                  {orders.filter((o) => o.status !== "completed").length})
                </TabsTrigger>
                <TabsTrigger value="tables" className="justify-start w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Tables ({tables.filter((t) => t.status === "occupied").length}
                  /{tables.length})
                </TabsTrigger>
                <TabsTrigger
                  value="reservations"
                  className="justify-start w-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Reservations ({reservations.length})
                </TabsTrigger>
                <TabsTrigger value="menu" className="justify-start w-full">
                  <MenuIcon className="w-4 h-4 mr-2" />
                  Menu ({menuItems.length})
                </TabsTrigger>
                <TabsTrigger value="settings" className="justify-start w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Desktop Header */}
          <header className="hidden lg:block sticky top-0 z-40 px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  桜 Sakura Admin
                </h1>
                <Badge
                  variant="outline"
                  className="text-green-700 border-green-200 bg-green-50"
                >
                  <div className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications (
                  {orders.filter((o) => o.status === "pending").length})
                </Button>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 lg:p-6">
            {loading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="text-lg">Loading admin dashboard...</span>
                </div>
              </div>
            ) : (
              <>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  {/* Dashboard Tab */}
                  <TabsContent value="dashboard" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                      <div className="flex space-x-2">
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export Report
                        </Button>
                        <Button>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          View Analytics
                        </Button>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <DashboardStats stats={stats} orders={orders} tables={tables} />

                    {/* Recent Orders */}
                    <RecentOrders
                      orders={orders}
                      onRefresh={fetchOrders}
                      onUpdateStatus={updateOrderStatus}
                    />
                  </TabsContent>

                  {/* Orders Tab */}
                  <TabsContent value="orders" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-bold text-gray-900">
                        Orders Management
                      </h2>
                      <div className="flex space-x-2">
                        <div className="relative">
                          <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                          <Input
                            placeholder="Search orders..."
                            className="w-64 pl-10"
                          />
                        </div>
                        <Select defaultValue="all">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="served">Served</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <OrdersList orders={orders} onUpdateStatus={updateOrderStatus} />
                  </TabsContent>

                  {/* Tables Tab */}
                  <TabsContent value="tables" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-bold text-gray-900">
                        Table Management
                      </h2>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Table
                      </Button>
                    </div>

                    <TablesGrid tables={tables} />
                  </TabsContent>

                  {/* Reservations Tab */}
                  <TabsContent value="reservations" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-bold text-gray-900">
                        Reservations
                      </h2>
                      <Button onClick={openReservationModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Reservation
                      </Button>
                    </div>

                    <ReservationsList 
                      reservations={reservations} 
                      onStatusChange={handleReservationStatusChange}
                      onCancel={handleReservationCancel}
                      onEdit={openEditReservationModal}
                      onDelete={handleDeleteReservation}
                    />
                  </TabsContent>

                  {/* Menu Tab */}
                  <TabsContent value="menu" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-bold text-gray-900">
                        Menu Management
                      </h2>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                          <Input
                            placeholder="Хоол хайх..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-10"
                          />
                        </div>
                        <Button
                          onClick={() => {
                            // MenuGrid ref ашиглан modal нээх
                            menuGridRef.current?.openAddModal();
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Menu Item
                        </Button>
                      </div>
                    </div>

                    {/* Dishes Category Filter */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dishes category
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {/* All Dishes Button */}
                        <button
                          onClick={() => setSelectedCategory("all")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                            selectedCategory === "all"
                              ? "border-red-500 bg-white text-gray-900"
                              : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <span>All Dishes</span>
                          <Badge className="px-2 py-1 text-xs text-white bg-gray-900 rounded-full">
                            {menuItems.length}
                          </Badge>
                        </button>

                        {/* Category Buttons */}
                        {categories.map((category) => {
                          const categoryItemCount = menuItems.filter(
                            (item) => item.category?.nameEn === category.nameEn
                          ).length;

                          return (
                            <button
                              key={category._id}
                              onClick={() => setSelectedCategory(category.nameEn)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                                selectedCategory === category.nameEn
                                  ? "border-red-500 bg-white text-gray-900"
                                  : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                              }`}
                            >
                              <span>{category.nameEn}</span>
                              <Badge className="px-2 py-1 text-xs text-white bg-gray-900 rounded-full">
                                {categoryItemCount}
                              </Badge>
                            </button>
                          );
                        })}

                        {/* Add Category Button */}
                        <button
                          onClick={openCategoryModal}
                          className="flex items-center justify-center w-10 h-10 text-white transition-colors bg-red-500 rounded-full hover:bg-red-600"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <MenuGrid
                      ref={menuGridRef}
                      menuItems={menuItems}
                      categories={categories}
                      searchQuery={searchQuery}
                      selectedCategory={selectedCategory}
                      onAdd={addMenuItem}
                      onUpdate={updateMenuItem}
                      onDelete={deleteMenuItem}
                    />
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
                    <SettingsForm />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Категори нэмэх Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Шинэ категори нэмэх</DialogTitle>
            <DialogDescription>
              Шинэ категорийн мэдээллийг оруулна уу
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoryNameEn">Нэр (Англи)</Label>
                <Input
                  id="categoryNameEn"
                  value={categoryFormData.nameEn}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      nameEn: e.target.value,
                    })
                  }
                  placeholder="English name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoryNameMn">Нэр (Монгол)</Label>
                <Input
                  id="categoryNameMn"
                  value={categoryFormData.nameMn}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      nameMn: e.target.value,
                    })
                  }
                  placeholder="Монгол нэр"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="categoryDescription">Тайлбар</Label>
              <Textarea
                id="categoryDescription"
                value={categoryFormData.description}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Категорийн тайлбар"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="categoryOrder">Дараалал</Label>
              <Input
                id="categoryOrder"
                type="number"
                value={categoryFormData.order}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeCategoryModal}
              >
                Цуцлах
              </Button>
              <Button type="submit" disabled={categoryLoading}>
                {categoryLoading ? "Нэмж байна..." : "Нэмэх"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={closeReservationModal}
        onSubmit={handleReservationSubmit}
        tables={tables}
      />

      {/* Edit Reservation Modal */}
      <EditReservationModal
        isOpen={isEditReservationModalOpen}
        onClose={closeEditReservationModal}
        onSave={handleEditReservation}
        reservation={selectedReservation}
        tables={tables}
      />
    </div>
  );
}

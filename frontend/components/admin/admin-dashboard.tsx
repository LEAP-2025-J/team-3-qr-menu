"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  Utensils,
  Table as TableIcon,
  TrendingUp,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";
import { DashboardStats } from "./dashboard-stats";
import { MenuManagement } from "./menu-management";
import { OrdersList } from "./orders-list";
import { ReservationsList } from "./reservations-list";
import { TableLayout } from "./table-layout";
import { SettingsForm } from "./settings-form";
import { ReservationModal } from "./reservation-modal";
import { EditReservationModal } from "./edit-reservation-modal";
import { CreateOrderModal } from "./create-order-modal";
import { useAdminData } from "@/hooks/use-admin-data";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { CategoryModal } from "./category-modal";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isEditReservationModalOpen, setIsEditReservationModalOpen] =
    useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  const { toast } = useToast();

  const {
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
  } = useAdminData();

  // MenuGrid ref
  const menuGridRef = React.useRef<any>(null);

  // Table functions
  const handleTableStatusChange = async (
    tableId: string,
    status: "empty" | "reserved"
  ) => {
    try {
      const response = await fetch(
        `http://192.168.0.102:5000/api/tables/${tableId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        fetchTables();
      }
    } catch (error) {
      console.error("Error updating table status:", error);
    }
  };

  const handleViewQR = (tableId: string) => {
    // QR code view logic
    console.log("View QR for table:", tableId);
  };

  const handleCompleteOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "completed");
  };

  const handleCancelOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "cancelled");
  };

  const handlePrintOrder = (orderId: string) => {
    // Print order logic
    console.log("Print order:", orderId);
  };

  const handleRefresh = async () => {
    await Promise.all([fetchOrders(), fetchTables(), fetchReservations()]);
  };

  const handleCreateOrder = async (orderData: {
    tableId: string;
    items: any[];
    total: number;
  }) => {
    try {
      const requestBody = {
        tableId: orderData.tableId,
        items: orderData.items.map((item) => ({
          menuItemId: item.menuItemId || item.menuItem?._id,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions,
        })),
        total: orderData.total,
        status: "pending",
      };

      // Захиалга үүсгэх API дуудах
      const response = await fetch("http://192.168.0.102:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("API response status:", response.status);

      if (response.ok) {
        const responseData = await response.json();

        // Ширээний мэдээллийг шинэчлэх
        await fetchTables();
        // Захиалгын жагсаалтыг бас шинэчлэх
        await fetchOrders();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false };
      }
    } catch (error) {
      console.error("Захиалга үүсгэхэд алдаа гарлаа:", error);
      return { success: false };
    }
  };

  // Global error handler for API responses
  const handleApiResponse = async (
    response: Response,
    errorMessage: string
  ) => {
    try {
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return { success: true, data, message: data.message };
        } else {
          return {
            success: false,
            error: data.error || data.message || errorMessage,
          };
        }
      } else {
        // Try to parse error response as JSON, fallback to text if it fails
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If JSON parsing fails, get the raw text
          const rawText = await response.text();
          errorData = { error: rawText || errorMessage };
        }

        return {
          success: false,
          error: errorData.error || errorData.message || errorMessage,
          status: response.status,
        };
      }
    } catch (error) {
      console.error("Error handling API response:", error);
      return { success: false, error: "Failed to process server response" };
    }
  };

  // Reservation management functions
  const handleReservationStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reservations/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const result = await handleApiResponse(
        response,
        "Failed to update reservation status"
      );

      if (result.success) {
        fetchReservations();
        fetchTables();
        toast({
          title: "Reservation status updated successfully!",
          description: result.message || "Reservation status updated.",
        });
      } else {
        console.error("Failed to update reservation status:", result.error);
        toast({
          title: "Failed to update reservation status",
          description: result.error || "Failed to update reservation status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating reservation status:", error);
      toast({
        title: "Failed to update reservation status",
        description: "Error updating reservation status.",
        variant: "destructive",
      });
    }
  };

  const handleReservationCancel = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reservations/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await handleApiResponse(
        response,
        "Failed to cancel reservation"
      );

      if (result.success) {
        fetchReservations();
        fetchTables();
        toast({
          title: "Reservation cancelled successfully!",
          description: result.message || "Reservation cancelled.",
        });
      } else {
        console.error("Failed to cancel reservation:", result.error);
        toast({
          title: "Failed to cancel reservation",
          description: result.error || "Failed to cancel reservation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast({
        title: "Failed to cancel reservation",
        description: "Error cancelling reservation.",
        variant: "destructive",
      });
    }
  };

  const handleReservationEdit = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsEditReservationModalOpen(true);
  };

  const handleReservationDelete = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reservations/${id}/delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await handleApiResponse(
        response,
        "Failed to delete reservation"
      );

      if (result.success) {
        fetchReservations();
        fetchTables();
        toast({
          title: "Reservation deleted successfully!",
          description: result.message || "Reservation deleted.",
        });
      } else {
        console.error("Failed to delete reservation:", result.error);
        toast({
          title: "Failed to delete reservation",
          description: result.error || "Failed to delete reservation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      toast({
        title: "Failed to delete reservation",
        description: "Error deleting reservation.",
        variant: "destructive",
      });
    }
  };

  const handleReservationSubmit = async (reservationData: any) => {
    try {
      // Convert tableId to table to match the backend model
      const { tableId, ...otherData } = reservationData;
      const requestData = {
        ...otherData,
        table: tableId,
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
        setIsReservationModalOpen(false);
        toast({
          title: "Reservation created successfully!",
          description: "Reservation created.",
        });
        return { success: true, message: "Reservation created successfully!" };
      } else {
        toast({
          title: "Failed to create reservation",
          description:
            data.error || data.message || "Failed to create reservation.",
          variant: "destructive",
        });
        return {
          success: false,
          error: data.error || data.message || "Failed to create reservation",
        };
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast({
        title: "Failed to create reservation",
        description: "Error creating reservation.",
        variant: "destructive",
      });
      return { success: false, error: "Error creating reservation" };
    }
  };

  const handleReservationEditSave = async (id: string, data: any) => {
    try {
      // Convert tableId to table to match the backend model
      const { tableId, ...otherData } = data;
      const requestData = {
        ...otherData,
        table: tableId,
      };

      const response = await fetch(
        `http://localhost:5000/api/reservations/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const responseData = await response.json();

      if (responseData.success) {
        // Refresh data
        fetchReservations();
        fetchTables();
        setIsEditReservationModalOpen(false);
        toast({
          title: "Reservation updated successfully!",
          description: "Reservation updated.",
        });
        return { success: true, message: "Reservation updated successfully!" };
      } else {
        toast({
          title: "Failed to update reservation",
          description:
            responseData.error ||
            responseData.message ||
            "Failed to update reservation.",
          variant: "destructive",
        });
        return {
          success: false,
          error:
            responseData.error ||
            responseData.message ||
            "Failed to update reservation",
        };
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast({
        title: "Failed to update reservation",
        description: "Error updating reservation.",
        variant: "destructive",
      });
      return { success: false, error: "Error updating reservation" };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex-1 p-6">
          <div className="space-y-4 animate-pulse">
            <div className="w-1/4 h-8 bg-gray-300 rounded"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-[210px] min-w-0">
        <AdminHeader />

        <main className="flex-1 p-8 w-full max-w-none">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Tables Tab */}
            <TabsContent value="orders" className="space-y-8">
              <TableLayout
                tables={tables}
                menuItems={menuItems}
                reservations={reservations}
                onStatusChange={handleTableStatusChange}
                onViewQR={handleViewQR}
                onRefresh={fetchTables}
                onCompleteOrder={handleCompleteOrder}
                onCancelOrder={handleCancelOrder}
                onPrintOrder={handlePrintOrder}
                onCreateOrder={handleCreateOrder}
              />
            </TabsContent>

            {/* Menu Tab */}
            <TabsContent value="menu" className="space-y-6">
              <MenuManagement
                menuItems={menuItems}
                categories={categories}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                onSearchChange={setSearchQuery}
                onCategoryChange={setSelectedCategory}
                onAddMenuItem={addMenuItem}
                onUpdateMenuItem={updateMenuItem}
                onDeleteMenuItem={deleteMenuItem}
                onAddCategory={addCategory}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Тохиргоо</h2>
              </div>

              <SettingsForm />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={addCategory}
      />

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        onSubmit={handleReservationSubmit}
        tables={tables}
        existingReservations={reservations}
      />

      {/* Edit Reservation Modal */}
      <EditReservationModal
        isOpen={isEditReservationModalOpen}
        onClose={() => setIsEditReservationModalOpen(false)}
        onSave={handleReservationEditSave}
        reservation={selectedReservation}
        tables={tables}
      />
    </div>
  );
}

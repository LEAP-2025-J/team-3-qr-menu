"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { TableLayout } from "./table-layout";
import { ReservationsList } from "./reservations-list";
import { MenuManagement } from "./menu-management";
import { SettingsForm } from "./settings-form";
import { CategoryModal } from "./category-modal";
import { OrderHistory } from "./order-history";
import { ReservationModal } from "./reservation-modal";
import { EditReservationModal } from "./edit-reservation-modal";
import { useAdminData } from "@/hooks/use-admin-data";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isEditReservationModalOpen, setIsEditReservationModalOpen] =
    useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

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
  const menuGridRef = useRef<any>(null);

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

      if (response.ok) {
        fetchReservations();
        fetchTables();
      } else {
        console.error("Failed to update reservation status");
      }
    } catch (error) {
      console.error("Error updating reservation status:", error);
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

      if (response.ok) {
        fetchReservations();
        fetchTables();
      } else {
        console.error("Failed to cancel reservation");
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
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

      if (response.ok) {
        fetchReservations();
        fetchTables();
      } else {
        console.error("Failed to delete reservation");
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
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
        return { success: true, message: "Reservation created successfully!" };
      } else {
        return {
          success: false,
          error: data.error || data.message || "Failed to create reservation",
        };
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
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
        return { success: true, message: "Reservation updated successfully!" };
      } else {
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
      <div className="flex-1 flex flex-col ml-[210px]">
        <AdminHeader />

        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <TableLayout
                tables={tables}
                menuItems={menuItems}
                onStatusChange={handleTableStatusChange}
                onViewQR={handleViewQR}
                onRefresh={fetchTables}
                onCompleteOrder={handleCompleteOrder}
                onCancelOrder={handleCancelOrder}
                onPrintOrder={handlePrintOrder}
                onCreateOrder={handleCreateOrder}
              />
            </TabsContent>

            {/* Reservations Tab */}
            <TabsContent value="reservations" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">
                  Reservations
                </h2>
                <Button
                  onClick={() => setIsReservationModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  + New Reservation
                </Button>
              </div>

              <ReservationsList
                reservations={reservations}
                onStatusChange={handleReservationStatusChange}
                onCancel={handleReservationCancel}
                onEdit={handleReservationEdit}
                onDelete={handleReservationDelete}
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

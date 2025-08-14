"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { TableLayout } from "./table-layout";
import { ReservationsList } from "./reservations-list";
import { MenuManagement } from "./menu-management";
import { SettingsForm } from "./settings-form";
import { CategoryModal } from "./category-modal";
import { OrderHistory } from "./order-history";
import { useAdminData } from "@/hooks/use-admin-data";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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
        `http://localhost:5000/api/tables/${tableId}`,
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

  const handleCreateOrder = async (orderData: {
    tableId: string;
    items: any[];
    total: number;
  }) => {
    try {
      console.log("API-д илгээх өгөгдөл:", orderData);

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

      console.log("API request body:", requestBody);

      // Захиалга үүсгэх API дуудах
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("API response status:", response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log("API response data:", responseData);

        // Ширээний мэдээллийг шинэчлэх
        await fetchTables();
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error("API алдаа:", errorData);
        return { success: false };
      }
    } catch (error) {
      console.error("Захиалга үүсгэхэд алдаа гарлаа:", error);
      return { success: false };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
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
              </div>

              <ReservationsList reservations={reservations} />
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
    </div>
  );
}

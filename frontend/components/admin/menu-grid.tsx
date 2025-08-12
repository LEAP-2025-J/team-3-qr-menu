"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MenuIcon, Plus } from "lucide-react";
import { MenuCard } from "./menu-card";
import { MenuModal } from "./menu-modal";

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

interface MenuGridProps {
  menuItems: MenuItem[];
  categories: Category[];
  searchQuery?: string;
  selectedCategory?: string;
  onAdd?: (
    menuData: any
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  onUpdate?: (
    id: string,
    menuData: any
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  onDelete?: (
    id: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export interface MenuGridRef {
  openAddModal: () => void;
}

export const MenuGrid = forwardRef<MenuGridRef, MenuGridProps>(
  (
    {
      menuItems,
      categories,
      searchQuery = "",
      selectedCategory = "all",
      onAdd,
      onUpdate,
      onDelete,
    },
    ref
  ) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);

    // Хайлтын функц
    const filteredMenuItems = menuItems.filter((item) => {
      // Категори шүүлтүүр
      if (
        selectedCategory !== "all" &&
        item.category?.nameEn !== selectedCategory
      ) {
        return false;
      }

      // Хайлтын шүүлтүүр
      const query = searchQuery.toLowerCase();
      return (
        item.nameEn.toLowerCase().includes(query) ||
        item.nameMn.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category?.nameEn.toLowerCase().includes(query) ||
        item.price.toString().includes(query)
      );
    });

    // Хоолны жагсаалтыг категориор нь бүлэглэх функц
    const groupMenuItemsByCategory = () => {
      const grouped: { [key: string]: MenuItem[] } = {};

      filteredMenuItems.forEach((item) => {
        const categoryName = item.category?.nameEn || "Uncategorized";
        if (!grouped[categoryName]) {
          grouped[categoryName] = [];
        }
        grouped[categoryName].push(item);
      });

      // Категорийн дарааллыг харгалзах
      const sortedCategories = categories
        .sort((a, b) => a.order - b.order)
        .map((cat) => cat.nameEn);

      // Uncategorized-ийг төгсгөлд нь оруулах
      if (grouped["Uncategorized"]) {
        sortedCategories.push("Uncategorized");
      }

      // Дарааллаар нь эрэмбэлэх
      const sortedGrouped: { [key: string]: MenuItem[] } = {};
      sortedCategories.forEach((categoryName) => {
        if (grouped[categoryName]) {
          sortedGrouped[categoryName] = grouped[categoryName];
        }
      });

      return sortedGrouped;
    };

    // Modal нээх - Add mode
    const openAddModal = () => {
      setIsEditMode(false);
      setCurrentItem(null);
      setIsModalOpen(true);
    };

    // Ref-ээр дуудах боломжтой болгох
    useImperativeHandle(ref, () => ({
      openAddModal,
    }));

    // Modal нээх - Edit mode
    const openEditModal = (item: MenuItem) => {
      setIsEditMode(true);
      setCurrentItem(item);
      setIsModalOpen(true);
    };

    // Modal хаах
    const closeModal = () => {
      setIsModalOpen(false);
    };

    // Form submit handler
    const handleSubmit = async (formData: FormData) => {
      const result =
        isEditMode && currentItem
          ? await onUpdate?.(currentItem._id, formData)
          : await onAdd?.(formData);
      return result || { success: false, error: "Алдаа гарлаа" };
    };

    // Delete function
    const handleDelete = async (id: string) => {
      if (!confirm("Энэ барааг устгахдаа итгэлтэй байна уу?")) return;

      try {
        const result = await onDelete?.(id);
        if (result?.success) {
          alert(result.message || "Амжилттай устгагдлаа");
        } else {
          alert(result?.error || "Устгахад алдаа гарлаа");
        }
      } catch (error) {
        alert("Устгахад алдаа гарлаа");
      }
    };

    return (
      <>
        {/* Category Grouped Layout for Menu Items */}
        <div className="space-y-8">
          {Object.entries(groupMenuItemsByCategory()).map(
            ([categoryName, items]) => (
              <div key={categoryName} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-start">
                  <h2 className="pb-2 text-xl font-semibold text-gray-900 border-b-2 border-gray-200">
                    {categoryName} ({items.length})
                  </h2>
                </div>

                {/* Grid Layout for Items in this Category */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {items.map((item) => (
                    <MenuCard
                      key={item._id}
                      item={item}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Empty state */}
        {filteredMenuItems.length === 0 && (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <MenuIcon className="w-16 h-16 mx-auto text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchQuery
                  ? "Хайлтын үр дүн олдсонгүй"
                  : "No menu items found"}
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? `"${searchQuery}" гэсэн хайлтын үр дүн олдсонгүй`
                  : "Get started by adding your first menu item."}
              </p>
              {!searchQuery && (
                <Button onClick={openAddModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Add/Edit Modal */}
        <MenuModal
          isOpen={isModalOpen}
          onClose={closeModal}
          isEditMode={isEditMode}
          currentItem={currentItem}
          categories={categories}
          onSubmit={handleSubmit}
        />
      </>
    );
  }
);

MenuGrid.displayName = "MenuGrid";

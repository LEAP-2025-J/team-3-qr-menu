"use client";

import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Minus } from "lucide-react";
import { MenuGrid, MenuGridRef } from "./menu-grid";
import { CategoryModal } from "./category-modal";
import { MenuItem, Category } from "@/hooks/use-admin-data";

interface MenuManagementProps {
  menuItems: MenuItem[];
  categories: Category[];
  searchQuery: string;
  selectedCategory: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onAddMenuItem: (
    menuData: any
  ) => Promise<{ success: boolean; message: string }>;
  onUpdateMenuItem: (
    id: string,
    menuData: any
  ) => Promise<{ success: boolean }>;
  onDeleteMenuItem: (id: string) => Promise<{ success: boolean }>;
  onAddCategory: (categoryData: any) => Promise<{ success: boolean }>;
  onDeleteCategory: (categoryId: string) => Promise<{ success: boolean }>;
}

export function MenuManagement({
  menuItems,
  categories,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onAddCategory,
  onDeleteCategory,
}: MenuManagementProps) {
  const menuGridRef = useRef<MenuGridRef>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deleteCategoryMode, setDeleteCategoryMode] = useState(false);

  // Хамгийн сүүлийн дугаарыг тооцоолох
  const getNextOrder = () => {
    if (categories.length === 0) return 1;
    const maxOrder = Math.max(...categories.map((cat) => cat.order || 0));
    return maxOrder + 1;
  };

  // Категори хасах функц
  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Энэ категорийг устгахдаа итгэлтэй байна уу?")) {
      try {
        console.log("🗑️ Deleting category:", categoryId);
        const result = await onDeleteCategory(categoryId);
        console.log("🗑️ Delete result:", result);

        if (result.success) {
          console.log("✅ Category deleted successfully");
          // Амжилттай устгасны дараа:
          // 1. All dishes рүү шилжих
          onCategoryChange("all");
          // 2. Delete mode унтраах
          setDeleteCategoryMode(false);
        } else {
          console.error("❌ Delete failed:", result);
        }
      } catch (error) {
        console.error("💥 Category delete error:", error);
      }
    } else {
      // Cancel дарсан үед delete mode унтраах
      setDeleteCategoryMode(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">
          Хоолны цэс удирдлага
        </h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <Input
              placeholder="Хоол хайх..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
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
            Хоол нэмэх
          </Button>
        </div>
      </div>

      {/* Dishes Category Filter */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Dishes category</h3>
        <div className="flex flex-wrap gap-3 items-center">
          {/* All Dishes Button */}
          <button
            onClick={() => onCategoryChange("all")}
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
                onClick={() =>
                  deleteCategoryMode
                    ? handleDeleteCategory(category._id)
                    : onCategoryChange(category.nameEn)
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  deleteCategoryMode
                    ? "border-red-500 bg-red-50 text-red-700 hover:bg-red-100"
                    : selectedCategory === category.nameEn
                    ? "border-red-500 bg-white text-gray-900"
                    : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                }`}
                title={
                  deleteCategoryMode
                    ? `Delete ${category.nameEn}`
                    : `Filter by ${category.nameEn}`
                }
              >
                <span>{category.nameEn}</span>
                <Badge
                  className={`px-2 py-1 text-xs rounded-full ${
                    deleteCategoryMode
                      ? "text-red-700 bg-red-200"
                      : "text-white bg-gray-900"
                  }`}
                >
                  {categoryItemCount}
                </Badge>
                {deleteCategoryMode && (
                  <Minus className="w-4 h-4 text-red-600" />
                )}
              </button>
            );
          })}

          {/* Add Category Button */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-colors"
            title="Категори нэмэх"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Delete Category Button */}
          <button
            onClick={() => setDeleteCategoryMode(!deleteCategoryMode)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${
              deleteCategoryMode
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-red-800 hover:bg-red-900"
            }`}
            title={deleteCategoryMode ? "Цуцлах" : "Категори устгах"}
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Menu Grid */}
      <MenuGrid
        ref={menuGridRef}
        menuItems={menuItems}
        categories={categories}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onAddMenuItem={onAddMenuItem}
        onUpdateMenuItem={onUpdateMenuItem}
        onDeleteMenuItem={onDeleteMenuItem}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={onAddCategory}
        defaultOrder={getNextOrder()}
      />
    </div>
  );
}

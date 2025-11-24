"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { UserMenuGrid } from "./user-menu-grid";
import { MenuItem, Category } from "@/hooks/use-admin-data";

interface UserMenuManagementProps {
  menuItems: MenuItem[];
  categories: Category[];
  searchQuery: string;
  selectedCategory: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
}

export function UserMenuManagement({
  menuItems,
  categories,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
}: UserMenuManagementProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Хоолны цэс</h2>
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
                ? "border-blue-500 bg-white text-gray-900"
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
                onClick={() => onCategoryChange(category.nameEn)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  selectedCategory === category.nameEn
                    ? "border-blue-500 bg-white text-gray-900"
                    : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                }`}
                title={`Filter by ${category.nameEn}`}
              >
                <span>{category.nameEn}</span>
                <Badge className="px-2 py-1 text-xs text-white bg-gray-900 rounded-full">
                  {categoryItemCount}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid */}
      <UserMenuGrid
        menuItems={menuItems}
        categories={categories}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />
    </div>
  );
}

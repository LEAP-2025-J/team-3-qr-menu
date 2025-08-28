"use client";

import { UserMenuCard } from "./user-menu-card";

interface MenuItem {
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

interface Category {
  _id: string;
  name: string;
  nameEn: string;
  nameMn: string;
  description: string;
  order: number;
}

interface UserMenuGridProps {
  menuItems: MenuItem[];
  categories: Category[];
  searchQuery?: string;
  selectedCategory?: string;
}

export function UserMenuGrid({
  menuItems,
  categories,
  searchQuery = "",
  selectedCategory = "all",
}: UserMenuGridProps) {
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
      item.nameJp.toLowerCase().includes(query)
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

    return grouped;
  };

  const groupedItems = groupMenuItemsByCategory();

  // Категориуудыг order-оор эрэмбэлэх
  const sortedCategories = categories.sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  return (
    <div className="space-y-8">
      {Object.keys(groupedItems).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchQuery
              ? "Хайлтын үр дүн олдсонгүй"
              : "Хоолны цэс хоосон байна"}
          </p>
        </div>
      ) : (
        <>
          {/* All Dishes хэсэг */}
          {selectedCategory === "all" && groupedItems["Uncategorized"] && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Uncategorized
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedItems["Uncategorized"].map((item) => (
                  <UserMenuCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Категори тус бүр */}
          {sortedCategories.map((category) => {
            const categoryItems = groupedItems[category.nameEn];
            if (!categoryItems || categoryItems.length === 0) return null;

            return (
              <div key={category._id} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {category.nameEn}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryItems.map((item) => (
                    <UserMenuCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

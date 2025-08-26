import { useState, useEffect, useMemo } from "react";
import { API_CONFIG } from "@/config/api";
import { translateCategories } from "@/components/admin/utils/category-utils";

export function useMenu(currentLanguage: "en" | "mn" | "ja" = "mn") {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);

  // Helper function to get translated text
  const getText = (en: string, mn: string, ja: string) => {
    switch (currentLanguage) {
      case "en":
        return en;
      case "ja":
        return ja;
      default:
        return mn;
    }
  };

  // Helper function to translate category name
  const translateCategoryName = (
    category: { nameEn: string; nameMn: string; nameJa: string },
    lang: "en" | "mn" | "ja"
  ): string => {
    switch (lang) {
      case "en":
        return category.nameEn;
      case "ja":
        return category.nameJa;
      default:
        return category.nameMn;
    }
  };

  // Fetch menu data
  useEffect(() => {
    const startTime = Date.now();
    const minLoadingTime = 1500; // 1.5 seconds minimum

    setFetchingData(true);

    // Fetch menu items, categories, and restaurant settings
    Promise.all([
      fetch(`${API_CONFIG.BACKEND_URL}/api/menu`),
      fetch(`${API_CONFIG.BACKEND_URL}/api/categories`),
    ])
      .then((responses) => Promise.all(responses.map((res) => res.json())))
      .then(([menuData, categoriesData]) => {
        if (menuData.success) {
          setMenuItems(menuData.data);
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }

        // Calculate remaining time to ensure minimum loading duration
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minLoadingTime - elapsed);

        setTimeout(() => {
          setLoadingMenu(false);
          setFetchingData(false);
        }, remaining);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoadingMenu(false);
      });
  }, []);

  // Group menu items by category and sort by category order with translations
  const groupedMenu = useMemo(() => {
    const groups: Record<string, any[]> = {};

    // Group items by category
    menuItems.forEach((item) => {
      const cat = item.category?.nameEn || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    // Sort categories by their order field and add translations
    const sortedCategories = categories
      .sort((a, b) => a.order - b.order)
      .map((cat) => {
        // Ensure the category has all required name fields
        const categoryWithNames = {
          ...cat,
          nameEn: cat.nameEn || cat.name || "Unknown",
          nameMn: cat.nameMn || cat.nameEn || cat.name || "Unknown",
          nameJa: cat.nameJa || cat.nameEn || cat.name || "Unknown"
        };
        
        const translatedName = translateCategoryName(categoryWithNames, currentLanguage);
        
        return {
          ...categoryWithNames,
          translatedName: translatedName
        };
      });

    // Add "other" category at the end if it exists
    if (groups["other"]) {
      sortedCategories.push({ 
        nameEn: "other", 
        translatedName: getText("other", "бусад", "その他")
      });
    }

    // Create ordered grouped menu with translated names
    const orderedGroups: Record<string, any[]> = {};
    sortedCategories.forEach((category) => {
      if (groups[category.nameEn]) {
        // Use translated name as key, but ensure it's not undefined
        const key = category.translatedName || category.nameEn;
        orderedGroups[key] = groups[category.nameEn];
      }
    });

    return orderedGroups;
  }, [menuItems, categories, currentLanguage, getText, translateCategoryName]);

  return {
    menuItems,
    categories,
    loadingMenu,
    fetchingData,
    groupedMenu,
  };
} 
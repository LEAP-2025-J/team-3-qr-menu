import { useState, useEffect, useMemo } from "react";
import { API_CONFIG } from "@/config/api";

export function useMenu() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);

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

  // Group menu items by category and sort by category order
  const groupedMenu = useMemo(() => {
    const groups: Record<string, any[]> = {};

    // Group items by category
    menuItems.forEach((item) => {
      const cat = item.category?.nameEn || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    // Sort categories by their order field (matching admin panel)
    const sortedCategories = categories
      .sort((a, b) => a.order - b.order)
      .map((cat) => cat.nameEn);

    // Add "other" category at the end if it exists
    if (groups["other"]) {
      sortedCategories.push("other");
    }

    // Create ordered grouped menu
    const orderedGroups: Record<string, any[]> = {};
    sortedCategories.forEach((categoryName) => {
      if (groups[categoryName]) {
        orderedGroups[categoryName] = groups[categoryName];
      }
    });

    return orderedGroups;
  }, [menuItems, categories]);

  return {
    menuItems,
    categories,
    loadingMenu,
    fetchingData,
    groupedMenu,
  };
} 
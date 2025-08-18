import { useState, useEffect } from "react";
import { API_CONFIG } from "@/config/api";

export function useRestaurant(currentLanguage: "en" | "mn" | "ja") {
  const [restaurantName, setRestaurantName] = useState("Sakura");
  const [restaurantData, setRestaurantData] = useState<any>(null);

  // Fetch restaurant data
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/restaurant`);
        const data = await response.json();
        
        if (data.success) {
          const restaurant = data.data;
          setRestaurantData(restaurant);
          updateRestaurantName(restaurant);
        }
      } catch (error) {
        console.error("Restaurant data fetch error:", error);
      }
    };

    fetchRestaurantData();
  }, []); // Remove currentLanguage dependency

  // Update restaurant name when language changes
  useEffect(() => {
    if (restaurantData) {
      updateRestaurantName(restaurantData);
    }
  }, [currentLanguage, restaurantData]);

  // Update restaurant name based on language
  const updateRestaurantName = (restaurant: any) => {
    if (!restaurant) return;
    
    let newName: string;
    switch (currentLanguage) {
      case "en":
        newName = restaurant.nameEn;
        break;
      case "ja":
        newName = restaurant.name;
        break;
      default:
        newName = restaurant.nameMn;
        break;
    }
    setRestaurantName(newName);
  };

  // Get restaurant description based on current language
  const getRestaurantDescription = () => {
    if (!restaurantData) return "Хотын төвд байрлах жинхэнэ Япон хоол";

    let description: string;
    switch (currentLanguage) {
      case "en":
        description = restaurantData.descriptionEn || "Experience the perfect blend of tradition and innovation";
        break;
      case "ja":
        description = restaurantData.description || "街の中心で本格的な日本料理をお楽しみください";
        break;
      default:
        description = restaurantData.descriptionMn || "Хотын төвд байрлах жинхэнэ Япон хоол";
        break;
    }
    return description;
  };

  // Check if current time is before 7pm for discount
  const isBefore7PM = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour < 19; // 7pm = 19:00
  };

  // Calculate discounted price (10% off)
  const getDiscountedPrice = (originalPrice: number) => {
    return originalPrice * 0.9; // 10% discount
  };

  return {
    restaurantName,
    restaurantData,
    getRestaurantDescription,
    isBefore7PM,
    getDiscountedPrice,
  };
} 
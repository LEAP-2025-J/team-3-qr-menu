import { useState, useEffect } from "react";
import { API_CONFIG } from "@/config/api";

interface DiscountSettings {
  discountPercentage: number;
  discountEndTime: string;
  isActive: boolean;
  description: string;
}

export function useDiscount() {
  const [discountSettings, setDiscountSettings] = useState<DiscountSettings>({
    discountPercentage: 1,
    discountEndTime: "19:00", // Backend-аас авах
    isActive: true,
    description: "Хөгжөөний цаг! 19:00 цагийн өмнөх бүх бараанд 1% хөнгөлөлт",
  });
  const [loading, setLoading] = useState(true);

  // Хөнгөлөлтийн тохиргоог авах
  const fetchDiscountSettings = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/discount/settings`
      );
      const data = await response.json();

      if (data.success) {
        setDiscountSettings(data.data);
      }
    } catch (error) {
      console.error("Хөнгөлөлтийн тохиргоо авахад алдаа:", error);
    } finally {
      setLoading(false);
    }
  };

  // Хөнгөлөлтийн тохиргоог шинэчлэх
  const updateDiscountSettings = async (
    settings: Partial<DiscountSettings>
  ) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/discount/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      const data = await response.json();

      if (data.success) {
        setDiscountSettings(data.data);
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Хөнгөлөлтийн тохиргоо шинэчлэхэд алдаа:", error);
      return { success: false, error: "Сүлжээний алдаа" };
    }
  };

  // Одоогийн цаг хөнгөлөлтийн хугацаанд байгаа эсэхийг шалгах (UTC+8)
  const isDiscountTime = () => {
    if (!discountSettings.isActive) return false;

    // Одоогийн цагийг UTC+8 timezone-тай болгож авах (Mongolia timezone)
    const now = new Date();

    // UTC+8 timezone-тай болгож авах
    const utc8Time = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" })
    );

    const currentHour = utc8Time.getHours();
    const currentMinute = utc8Time.getMinutes();

    // Хөнгөлөлтийн дуусах цагийг парслах
    const [endHour, endMinute] = discountSettings.discountEndTime
      .split(":")
      .map(Number);

    // Одоогийн цаг хөнгөлөлтийн хугацаанд байгаа эсэхийг шалгах
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    return currentTimeInMinutes < endTimeInMinutes;
  };

  // Хөнгөлөлттэй үнэ тооцоолох
  const getDiscountedPrice = (originalPrice: number) => {
    if (!isDiscountTime()) {
      return originalPrice;
    }

    const discountMultiplier =
      (100 - discountSettings.discountPercentage) / 100;
    return Math.round(originalPrice * discountMultiplier);
  };

  // Хөнгөлөлтийн мэдээллийг авах
  const getDiscountInfo = () => {
    if (!isDiscountTime()) {
      return null;
    }

    return {
      percentage: discountSettings.discountPercentage,
      endTime: discountSettings.discountEndTime,
      description: discountSettings.description,
    };
  };

  useEffect(() => {
    fetchDiscountSettings();
  }, []);

  return {
    discountSettings,
    loading,
    isDiscountTime,
    getDiscountedPrice,
    getDiscountInfo,
    updateDiscountSettings,
    fetchDiscountSettings,
  };
}

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

    // Business day mode-г шалгах (SSR-д localStorage байхгүй байж болно)
    let isBusinessDayMode = false;
    if (typeof window !== "undefined") {
      isBusinessDayMode = localStorage.getItem("businessDayMode") === "true";
    }

    // Одоогийн цагийг UTC+8 timezone-тай болгож авах (Mongolia timezone)
    const now = new Date();
    const utc8Time = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" })
    );

    const currentHour = utc8Time.getHours();
    const currentMinute = utc8Time.getMinutes();

    if (isBusinessDayMode) {
      // Business day mode-д хөнгөлөлтийн логик
      // 04:00-09:00 хооронд хөнгөлөлт ажиллахгүй (өмнөх өдрийн business day)
      if (currentHour >= 0 && currentHour < 9) {
        return false;
      }

      // 09:00-24:00 хооронд хөнгөлөлтийн цагийг шалгах
      const [endHour, endMinute] = discountSettings.discountEndTime
        .split(":")
        .map(Number);

      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;

      return currentTimeInMinutes < endTimeInMinutes;
    } else {
      // Хуучин логик - UTC+8 timezone ашиглах (Mongolia timezone)
      const [endHour, endMinute] = discountSettings.discountEndTime
        .split(":")
        .map(Number);

      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;

      return currentTimeInMinutes < endTimeInMinutes;
    }
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
    // SSR-д hydration алдаа гарахаас сэргийлэх
    if (typeof window === "undefined") {
      return;
    }

    fetchDiscountSettings();
  }, []);

  // Business day mode өөрчлөгдөхөд хөнгөлөлтийн мэдээллийг дахин авах
  useEffect(() => {
    const handleBusinessDayModeChange = () => {
      // Хөнгөлөлтийн мэдээллийг дахин тооцоолох
      console.log(
        "🔄 Business day mode өөрчлөгдсөн - хөнгөлөлтийн мэдээллийг дахин тооцоолж байна"
      );
    };

    window.addEventListener(
      "businessDayModeChanged",
      handleBusinessDayModeChange
    );
    return () => {
      window.removeEventListener(
        "businessDayModeChanged",
        handleBusinessDayModeChange
      );
    };
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

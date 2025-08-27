"use client";

import { useState, useEffect } from "react";

// Business day мэдээллийг авах hook
export function useBusinessDay() {
  const [isBusinessDayMode, setIsBusinessDayMode] = useState(false);
  const [currentBusinessDay, setCurrentBusinessDay] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // localStorage-аас business day mode-г авах
      const businessDayMode =
        localStorage.getItem("businessDayMode") === "true";
      setIsBusinessDayMode(businessDayMode);

      // Одоогийн business day-г тооцоолох
      const now = new Date();
      const mongoliaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);

      // 09:00-04:00 business day логик
      let businessDayStart = new Date(mongoliaTime);
      businessDayStart.setHours(9, 0, 0, 0);

      let businessDayEnd = new Date(mongoliaTime);
      businessDayEnd.setHours(4, 0, 0, 0);
      businessDayEnd.setDate(businessDayEnd.getDate() + 1); // Маргааш 04:00

      let currentDay = new Date(mongoliaTime);

      // Хэрэв одоо 04:00-09:00 хооронд бол өчигдрийн business day
      if (mongoliaTime.getHours() >= 4 && mongoliaTime.getHours() < 9) {
        currentDay.setDate(currentDay.getDate() - 1);
      }

      const businessDayString = currentDay.toISOString().split("T")[0];
      setCurrentBusinessDay(businessDayString);

      // Business day mode өөрчлөгдөх үед сонсох
      const handleBusinessDayModeChange = () => {
        const newMode = localStorage.getItem("businessDayMode") === "true";
        setIsBusinessDayMode(newMode);
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
    }
  }, []);

  // Business day мэдээллийг буцаах
  const getBusinessDayInfo = () => {
    if (!isBusinessDayMode) {
      return null;
    }

    return {
      currentBusinessDay,
      isActive: true,
    };
  };

  return {
    isBusinessDayMode,
    getBusinessDayInfo,
  };
}

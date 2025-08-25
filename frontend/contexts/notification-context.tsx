"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { API_CONFIG } from "@/config/api";

interface NotificationContextType {
  notificationCount: number;
  addNotification: (tableNumber: number) => void;
  clearNotifications: () => void;
  markAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notificationCount, setNotificationCount] = useState(0);

  // Backend-аас notification count авах функц
  const fetchNotificationCount = useCallback(async () => {
    try {
      // Локал орчинд локал backend ашиглах
      const backendUrl = window.location.hostname.startsWith("192.168.")
        ? "http://localhost:5000"
        : API_CONFIG.BACKEND_URL;
      const url = `${backendUrl}/api/orders/notifications`;
      console.log("🌐 NotificationContext fetching from URL:", url);
      const response = await fetch(url);
      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Notification data:", data);
        if (data.success) {
          console.log(
            "📊 Setting notification count to:",
            data.data.unreadTableCount
          );
          setNotificationCount(data.data.unreadTableCount);
        }
      } else {
        console.error(
          "❌ Response not ok:",
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error("❌ Error response body:", errorText);
      }
    } catch (error) {
      console.error("💥 Error fetching notifications:", error);
    }
  }, []);

  // Backend-аас notification count унших (polling every 10 seconds)
  useEffect(() => {
    // Эхлээд localStorage цэвэрлэх (хуучин data арилгах)
    localStorage.removeItem("qr-notification-count");

    fetchNotificationCount(); // Анх удаа ачаалах

    const interval = setInterval(fetchNotificationCount, 10000); // 10 секунд тутам шалгах
    return () => clearInterval(interval);
  }, [fetchNotificationCount]);

  // localStorage арилгасан - зөвхөн backend ашиглана
  // const updateNotificationCount = useCallback((count: number) => {
  //   setNotificationCount(count);
  //   localStorage.setItem("qr-notification-count", count.toString());
  // }, []);

  // QR захиалга ирэхэд notification нэмэх (backend дамжуулж шалгах)
  const addNotification = useCallback(
    (tableNumber: number) => {
      // Backend-аас шинэ notification count авах
      fetchNotificationCount();

      // Toast notification харуулах
      if (typeof window !== "undefined") {
        // Custom event trigger хийх
        const event = new CustomEvent("qr-order-notification", {
          detail: { tableNumber },
        });
        window.dispatchEvent(event);
      }
    },
    [fetchNotificationCount]
  );

  // Бүх notification-г цэвэрлэх (backend дамжуулж шинэчлэх)
  const clearNotifications = useCallback(() => {
    setNotificationCount(0);
    // LocalStorage-ыг бүрэн цэвэрлэх
    localStorage.removeItem("qr-notification-count");
    // Backend дамжуулж шинэ count авах
    setTimeout(fetchNotificationCount, 1000);
  }, [fetchNotificationCount]);

  // Notification-г харагдсан гэж тэмдэглэх (backend дамжуулж шинэчлэх)
  const markAsRead = useCallback(async () => {
    try {
      // Backend дээр mark as read хийх
      const backendUrl = window.location.hostname.startsWith("192.168.")
        ? "http://localhost:5000"
        : API_CONFIG.BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/orders/mark-as-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("✅ Orders marked as read");
        // Шинэ count авах
        fetchNotificationCount();
      } else {
        console.error("❌ Failed to mark orders as read");
      }
    } catch (error) {
      console.error("💥 Error marking orders as read:", error);
    }
  }, [fetchNotificationCount]);

  // Custom event сонсох (QR захиалга ирэхэд)
  useEffect(() => {
    const handleQROrder = () => {
      // QR захиалга ирэхэд backend-аас шинэ count авах
      fetchNotificationCount();
    };

    window.addEventListener("qr-order-notification", handleQROrder);
    return () =>
      window.removeEventListener("qr-order-notification", handleQROrder);
  }, [fetchNotificationCount]);

  return (
    <NotificationContext.Provider
      value={{
        notificationCount,
        addNotification,
        clearNotifications,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}

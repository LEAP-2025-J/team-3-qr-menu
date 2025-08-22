"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

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

  // localStorage-с notification count унших
  useEffect(() => {
    const storedCount = localStorage.getItem("qr-notification-count");
    if (storedCount) {
      setNotificationCount(parseInt(storedCount));
    }
  }, []);

  // localStorage-д notification count хадгалах
  const updateNotificationCount = useCallback((count: number) => {
    setNotificationCount(count);
    localStorage.setItem("qr-notification-count", count.toString());
  }, []);

  // QR захиалга ирэхэд notification нэмэх
  const addNotification = useCallback(
    (tableNumber: number) => {
      const currentCount = parseInt(
        localStorage.getItem("qr-notification-count") || "0"
      );
      const newCount = currentCount + 1;
      updateNotificationCount(newCount);

      // Toast notification харуулах
      if (typeof window !== "undefined") {
        // Custom event trigger хийх
        const event = new CustomEvent("qr-order-notification", {
          detail: { tableNumber },
        });
        window.dispatchEvent(event);
      }
    },
    [updateNotificationCount]
  );

  // Бүх notification-г цэвэрлэх
  const clearNotifications = useCallback(() => {
    updateNotificationCount(0);
  }, [updateNotificationCount]);

  // Notification-г харагдсан гэж тэмдэглэх (тоо буурах)
  const markAsRead = useCallback(() => {
    const currentCount = parseInt(
      localStorage.getItem("qr-notification-count") || "0"
    );
    const newCount = Math.max(0, currentCount - 1);
    updateNotificationCount(newCount);
  }, [updateNotificationCount]);

  // localStorage өөрчлөгдөхийг сонсох (өөр tab-уудаас)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "qr-notification-count") {
        const newCount = e.newValue ? parseInt(e.newValue) : 0;
        setNotificationCount(newCount);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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

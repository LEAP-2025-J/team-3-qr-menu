"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LanguageProvider, useLanguage } from "@/contexts/language-context";
import { useCart } from "@/hooks/use-cart";
import { useMenu } from "@/hooks/use-menu";
import { useRestaurant } from "@/hooks/use-restaurant";
import { useTable } from "@/hooks/use-table";
import { API_CONFIG } from "@/config/api";
import { Header } from "@/components/qr-menu/header";
import { DiscountBanner } from "@/components/qr-menu/discount-banner";
import { CartModal } from "@/components/qr-menu/cart-modal";
import { MenuGrid } from "@/components/qr-menu/menu-grid";
import { Footer } from "@/components/qr-menu/footer";
import { ShoppingCart } from "lucide-react";

function QRMenuContent() {
  const pathname = usePathname();
  const { getText, currentLanguage } = useLanguage();
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  // Get table number from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const table = urlParams.get("table");
      setTableNumber(table);
    }
  }, []);

  // Use custom hooks
  const { tableAvailable, setTableAvailable } = useTable(tableNumber, getText);
  const {
    restaurantName,
    restaurantData,
    getRestaurantDescription,
    isBefore7PM,
    getDiscountedPrice,
  } = useRestaurant(currentLanguage);
  const { menuItems, categories, loadingMenu, fetchingData, groupedMenu } =
    useMenu(currentLanguage);
  const {
    cart,
    setCart,
    cartOpen,
    setCartOpen,
    isSubmitting,
    setIsSubmitting,
    addToCart,
    removeFromCart,
    changeQuantity,
    clearCart,
    total,
  } = useCart(tableNumber, tableAvailable, getText);

  // Handle add to cart with proper parameters
  const handleAddToCart = (item: any) => {
    addToCart(item, isBefore7PM(), getDiscountedPrice);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF7D1" }}>
      <Header
        restaurantName={restaurantName}
        restaurantDescription={getRestaurantDescription()}
        tableNumber={tableNumber}
      />

      <DiscountBanner />

      <MenuGrid
        loadingMenu={loadingMenu}
        groupedMenu={groupedMenu}
        fetchingData={fetchingData}
        isBefore7PM={isBefore7PM()}
        getDiscountedPrice={getDiscountedPrice}
        onAddToCart={handleAddToCart}
        getCartQuantity={(itemId: string) => {
          const item = cart.find((cartItem) => cartItem.id === itemId);
          return item ? item.quantity : 0;
        }}
      />

      {/* Floating Cart Button */}
      {pathname !== "/admin" && cart.length > 0 && (
        <button
          className="fixed z-50 px-4 py-2 text-sm rounded-full shadow-lg bottom-4 md:bottom-8 right-4 md:right-8 md:px-6 md:py-3 md:text-base"
          style={{ backgroundColor: "#FFFFFF", color: "#FF0000" }}
          onClick={() => setCartOpen(true)}
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" style={{ color: "#FF0000" }} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>
        </button>
      )}

      <CartModal
        cart={cart}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        tableNumber={tableNumber}
        total={total}
        isSubmitting={isSubmitting}
        onRemoveFromCart={removeFromCart}
        onChangeQuantity={changeQuantity}
        onClearCart={clearCart}
        onSubmitOrder={async () => {
          try {
            setIsSubmitting(true);

            // Create order data
            const orderData = {
              tableNumber: parseInt(tableNumber || "0"),
              items: cart.map((item) => ({
                menuItem: item.id,
                quantity: item.quantity,
                price: item.price,
                name: item.nameEn,
                nameMn: item.nameMn,
                nameJp: item.nameJp,
              })),
              total: total,
              status: "pending",
            };

            // Send order to backend

            const response = await fetch(
              `${API_CONFIG.BACKEND_URL}/api/orders`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
              }
            );

            if (!response.ok) {
              throw new Error(
                `Failed to submit order - Status: ${response.status}`
              );
            }

            const result = await response.json();

            if (result.success) {
              // Clear cart after successful order
              clearCart();
              setCartOpen(false);

              // Trigger notification for admin
              if (typeof window !== "undefined") {
                const tableNum = parseInt(tableNumber || "0");

                // localStorage-д notification хадгалах
                const currentCount = parseInt(
                  localStorage.getItem("qr-notification-count") || "0"
                );
                const newCount = currentCount + 1;
                localStorage.setItem(
                  "qr-notification-count",
                  newCount.toString()
                );

                // Хамгийн сүүлийн захиалгын table number хадгалах
                localStorage.setItem(
                  "last-qr-order",
                  JSON.stringify({ tableNumber: tableNum })
                );

                // Custom event trigger хийх
                const event = new CustomEvent("qr-order-notification", {
                  detail: { tableNumber: tableNum },
                });
                window.dispatchEvent(event);
              }

              // Show success message
              alert(
                getText(
                  "Order submitted successfully!",
                  "Захиалга амжилттай илгээгдлээ!",
                  "注文が正常に送信されました！"
                )
              );
            } else {
              throw new Error(result.error || "Failed to submit order");
            }
          } catch (error) {
            console.error("Error submitting order:", error);
            alert(
              getText(
                "Failed to submit order. Please try again.",
                "Захиалга илгээхэд алдаа гарлаа. Дахин оролдоно уу.",
                "注文の送信に失敗しました。もう一度お試しください。"
              )
            );
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      <Footer restaurantName={restaurantName} restaurantData={restaurantData} />
    </div>
  );
}

export default function QRMenu() {
  return (
    <LanguageProvider>
      <QRMenuContent />
    </LanguageProvider>
  );
}

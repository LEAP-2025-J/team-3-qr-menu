import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { submitOrder } from "@/components/admin/utils/order-submission";
import {
  showToast,
  clearLocalStorage,
  saveToLocalStorage,
} from "@/components/admin/utils/cart-utils";

export interface CartItem {
  id: string;
  nameEn: string;
  nameMn: string;
  nameJp: string;
  price: number;
  quantity: number;
  image?: string;
}

export function useCart(
  tableNumber: string | null,
  tableAvailable: boolean | null,
  getText: (en: string, mn: string, ja: string) => string
) {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cartLoaded = useRef(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (!cartLoaded.current && tableNumber) {
      const stored = localStorage.getItem("qr-menu-cart");
      const storedTableNumber = localStorage.getItem("qr-menu-table-number");
      const storedTimestamp = localStorage.getItem("qr-menu-timestamp");

      // Check expiration (5 minutes)
      const CART_EXPIRY_TIME = 5 * 60 * 1000;
      const currentTime = Date.now();
      const storedTime = storedTimestamp ? parseInt(storedTimestamp) : 0;
      const isExpired = currentTime - storedTime > CART_EXPIRY_TIME;

      // Clear cart if table changed or expired
      if (storedTableNumber !== tableNumber || isExpired) {
        setCart([]);
        clearLocalStorage();
        cartLoaded.current = true;
        return;
      }

      // Load cart if valid
      if (stored && storedTableNumber === tableNumber && !isExpired) {
        try {
          const parsedCart = JSON.parse(stored);
          if (parsedCart.length > 0 && !parsedCart[0].id) {
            setCart([]);
            clearLocalStorage();
          } else {
            setCart(parsedCart);
          }
        } catch (error) {
          console.error("Error parsing cart from localStorage:", error);
          setCart([]);
          clearLocalStorage();
        }
      }
      cartLoaded.current = true;
    }
  }, [tableNumber]);

  // Persist cart to localStorage
  useEffect(() => {
    if (cartLoaded.current) {
      saveToLocalStorage(cart, tableNumber);
    }
  }, [cart, tableNumber]);

  const addToCart = (
    item: {
      _id: string;
      nameEn: string;
      nameMn: string;
      nameJp: string;
      price: string | number;
      image?: string;
    },
    isBefore7PM: boolean,
    getDiscountedPrice: (price: number) => number
  ) => {
    // Validation checks
    if (!tableNumber) {
      showToast(toast, getText, "noTable");
      return;
    }

    if (tableAvailable === false) {
      showToast(toast, getText, "tableUnavailable");
      return;
    }

    // Add item to cart
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === item._id);
      const originalPrice =
        typeof item.price === "string"
          ? parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0
          : typeof item.price === "number" && !isNaN(item.price)
          ? item.price
          : 0;
      const finalPrice = isBefore7PM
        ? getDiscountedPrice(originalPrice)
        : originalPrice;

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          id: item._id,
          nameEn: item.nameEn,
          nameMn: item.nameMn,
          nameJp: item.nameJp,
          price: finalPrice,
          quantity: 1,
          image: item.image,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const changeQuantity = (id: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
    clearLocalStorage();
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const onSubmitOrder = async () => {
    if (!tableNumber) {
      showToast(toast, getText, "noTable");
      return;
    }

    if (cart.length === 0) {
      showToast(toast, getText, "emptyCart");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        tableNumber: parseInt(tableNumber),
        items: cart.map((item) => ({
          menuItem: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total: total,
      };

      const result = await submitOrder(orderData);

      if (result.success) {
        showToast(toast, getText, "orderSuccess");
        clearCart();
        setCartOpen(false);
      } else {
        throw new Error(result.error || "Failed to submit order");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      showToast(toast, getText, "orderFailed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
    onSubmitOrder,
  };
}

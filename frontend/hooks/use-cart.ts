import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
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
        localStorage.removeItem("qr-menu-cart");
        localStorage.removeItem("qr-menu-table-number");
        localStorage.removeItem("qr-menu-timestamp");
        cartLoaded.current = true;
        return;
      }

      // Load cart if valid
      if (stored && storedTableNumber === tableNumber && !isExpired) {
        try {
          const parsedCart = JSON.parse(stored);
          if (parsedCart.length > 0 && !parsedCart[0].id) {
            // Clear old format cart
            setCart([]);
            localStorage.removeItem("qr-menu-cart");
            localStorage.removeItem("qr-menu-timestamp");
          } else {
            setCart(parsedCart);
          }
        } catch (error) {
          console.error("Error parsing cart from localStorage:", error);
          setCart([]);
          localStorage.removeItem("qr-menu-cart");
          localStorage.removeItem("qr-menu-timestamp");
        }
      }
      cartLoaded.current = true;
    }
  }, [tableNumber]);

  // Persist cart to localStorage
  useEffect(() => {
    if (cartLoaded.current) {
      localStorage.setItem("qr-menu-cart", JSON.stringify(cart));
      if (tableNumber) {
        localStorage.setItem("qr-menu-table-number", tableNumber);
        localStorage.setItem("qr-menu-timestamp", Date.now().toString());
      }
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
    // Check if table is selected
    if (!tableNumber) {
      toast({
        title: getText(
          "❌ No Table Selected",
          "❌ Ширээ сонгоогүй",
          "❌ テーブルが選択されていません"
        ),
        description: getText(
          "Please scan a QR code to select a table first.",
          "Эхлээд QR код уншуулж ширээ сонгоно уу.",
          "まずQRコードをスキャンしてテーブルを選択してください。"
        ),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Check if table is available
    if (tableAvailable === false) {
      toast({
        title: getText(
          "❌ Cannot Add Items",
          "❌ Бараа нэмэх боломжгүй",
          "❌ 商品を追加できません"
        ),
        description: getText(
          "This table has an active order. Please wait for the table to become available.",
          "Энэ ширээ идэвхтэй захиалгатай байна. Та ширээ сулрахыг хүлээнэ үү.",
          "このテーブルは使用中です。テーブルが空くまでお待ちください。"
        ),
        variant: "destructive",
        duration: 5000,
      });
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

      // Apply discount if before 7pm
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
    localStorage.removeItem("qr-menu-cart");
    localStorage.removeItem("qr-menu-table-number");
    localStorage.removeItem("qr-menu-timestamp");
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const onSubmitOrder = async () => {
    if (!tableNumber) {
      toast({
        title: getText(
          "❌ No Table Selected",
          "❌ Ширээ сонгоогүй",
          "❌ テーブルが選択されていません"
        ),
        description: getText(
          "Please scan a QR code to select a table first.",
          "Эхлээд QR код уншуулж ширээ сонгоно уу.",
          "まずQRコードをスキャンしてテーブルを選択してください。"
        ),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: getText("❌ Empty Cart", "❌ Сагс хоосон", "❌ カートが空です"),
        description: getText(
          "Please add items to your cart before placing an order.",
          "Захиалга өгөхийн өмнө сагсанд бараа нэмнэ үү.",
          "注文する前にカートに商品を追加してください。"
        ),
        variant: "destructive",
        duration: 3000,
      });
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

      const response = await fetch(
        `https://backend-htk90mjru-kherlenchimegs-projects.vercel.app/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: getText(
            "✅ Order Submitted!",
            "✅ Захиалга илгээгдлээ!",
            "✅ 注文が送信されました！"
          ),
          description: getText(
            "Your order has been successfully submitted. We'll prepare it right away!",
            "Таны захиалга амжилттай илгээгдлээ. Бид түүнийг шууд бэлтгэх болно!",
            "注文が正常に送信されました。すぐに準備いたします！"
          ),
          duration: 5000,
        });

        // Clear cart after successful order
        clearCart();
        setCartOpen(false);
      } else {
        throw new Error(result.error || "Failed to submit order");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: getText(
          "❌ Order Failed",
          "❌ Захиалга амжилтгүй",
          "❌ 注文に失敗しました"
        ),
        description: getText(
          "Failed to submit order. Please try again.",
          "Захиалга илгээх амжилтгүй боллоо. Дахин оролдоно уу.",
          "注文の送信に失敗しました。もう一度お試しください。"
        ),
        variant: "destructive",
        duration: 5000,
      });
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

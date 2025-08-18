"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChefHat,
  Fish,
  Soup,
  Beef,
  Coffee,
  Clock,
  Calendar,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CategorySkeleton } from "@/components/ui/loading-skeleton";
import CloudinaryImage from "@/components/CloudinaryImage";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG } from "@/config/api";
import { useRouter } from "next/navigation";

const getCategoryIcon = (categoryName: string) => {
  const category = categoryName.toLowerCase();
  if (category.includes("appetizer") || category.includes("завсрын"))
    return ChefHat;
  if (category.includes("sushi") || category.includes("суши")) return Fish;
  if (category.includes("ramen") || category.includes("рамен")) return Soup;
  if (category.includes("main") || category.includes("үндсэн")) return Beef;
  if (category.includes("dessert") || category.includes("амттан"))
    return Coffee;
  if (category.includes("drink") || category.includes("ундаа")) return Coffee;
  return ChefHat; // default icon
};

const categoryIcons = {
  appetizers: ChefHat,
  sushi: Fish,
  ramen: Soup,
  "main dishes": Beef,
  desserts: Coffee,
  drinks: Coffee,
};

export default function QRMenu() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("appetizers");
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [cart, setCart] = useState<
    {
      id: string;
      nameEn: string;
      nameMn: string;
      nameJa: string;
      price: number;
      quantity: number;
      image?: string;
    }[]
  >([]);
  const [fetchingData, setFetchingData] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState("Sakura");
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "mn" | "ja">(
    "en"
  );
  const cartLoaded = useRef(false);
  const pathname = usePathname();
  const router = useRouter();

  // Backend API URL - config файлаас авна
  const API_BASE_URL = API_CONFIG.BACKEND_URL;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableAvailable, setTableAvailable] = useState<boolean | null>(null); // Ширээ ашиглах боломжтой эсэх

  // isSubmitting төлөвийг reset хийх функц
  const resetSubmittingState = () => {
    setIsSubmitting(false);
  };

  // Language helper function - default хэл нь монгол
  const getText = (en: string, mn: string, ja: string) => {
    switch (currentLanguage) {
      case "en":
        return en;
      case "ja":
        return ja;
      default:
        return mn; // default нь монгол хэл
    }
  };

  // Function to update restaurant name based on language - default хэл нь монгол
  const updateRestaurantName = (restaurant: any) => {
    let newName: string;
    switch (currentLanguage) {
      case "en":
        newName = restaurant.nameEn;
        break;
      case "ja":
        newName = restaurant.name;
        break;
      default:
        newName = restaurant.nameMn; // default нь монгол хэл
    }
    console.log(
      `Updating restaurant name to: ${newName} (language: ${currentLanguage})`
    );
    setRestaurantName(newName);
  };

  // Function to get restaurant description based on current language
  const getRestaurantDescription = () => {
    if (!restaurantData) return "Хотын төвд байрлах жинхэнэ Япон хоол";

    switch (currentLanguage) {
      case "en":
        return (
          restaurantData.descriptionEn ||
          "Experience the perfect blend of tradition and innovation"
        );
      case "ja":
        return (
          restaurantData.description ||
          "街の中心で本格的な日本料理をお楽しみください"
        );
      default:
        return (
          restaurantData.descriptionMn || "Хотын төвд байрлах жинхэнэ Япон хоол"
        );
    }
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

  const restaurantHours = {
    monday: "11:00 AM - 10:00 PM",
    tuesday: "11:00 AM - 10:00 PM",
    wednesday: "11:00 AM - 10:00 PM",
    thursday: "11:00 AM - 10:00 PM",
    friday: "11:00 AM - 11:00 PM",
    saturday: "12:00 PM - 11:00 PM",
    sunday: "12:00 PM - 9:00 PM",
  };

  // Load cart from localStorage on mount - хугацааны хязгаартай сагс (5 минут)
  useEffect(() => {
    if (!cartLoaded.current && tableNumber) {
      const stored = localStorage.getItem("qr-menu-cart");
      const storedTableNumber = localStorage.getItem("qr-menu-table-number");
      const storedTimestamp = localStorage.getItem("qr-menu-timestamp");

      // Хугацааны хязгаарыг шалгах (5 минут = 300000 миллисекунд)
      const CART_EXPIRY_TIME = 5 * 60 * 1000; // 5 минут
      const currentTime = Date.now();
      const storedTime = storedTimestamp ? parseInt(storedTimestamp) : 0;
      const isExpired = currentTime - storedTime > CART_EXPIRY_TIME;

      console.log("Сагсны хугацааны мэдээлэл:", {
        currentTime,
        storedTime,
        timeDifference: currentTime - storedTime,
        isExpired,
        expiryTime: CART_EXPIRY_TIME,
      });

      // Хэрэв ширээний дугаар өөрчлөгдсөн эсвэл хугацаа дууссан бол сагсыг цэвэрлэх
      if (storedTableNumber !== tableNumber || isExpired) {
        console.log(
          `Сагсыг цэвэрлэх: ${
            storedTableNumber !== tableNumber
              ? "Ширээ өөрчлөгдсөн"
              : "Хугацаа дууссан"
          }`
        );
        setCart([]);
        localStorage.removeItem("qr-menu-cart");
        localStorage.removeItem("qr-menu-table-number");
        localStorage.removeItem("qr-menu-timestamp");
        cartLoaded.current = true;
        return;
      }

      // Ширээний статусыг шалгах
      const checkTableStatus = async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/tables?number=${tableNumber}`
          );
          const data = await response.json();

          if (data.success && data.data.length > 0) {
            const table = data.data[0];
            console.log("Ширээний статус:", table.status);
            console.log("Ширээний currentOrder:", table.currentOrder);

            // Хэрэв ширээ захиалгатай бол сагсыг цэвэрлэх
            if (table.status === "reserved" && table.currentOrder) {
              console.log("Ширээ захиалгатай байна - сагсыг цэвэрлэх");
              setCart([]);
              localStorage.removeItem("qr-menu-cart");
              localStorage.removeItem("qr-menu-table-number");
              localStorage.removeItem("qr-menu-timestamp");
              cartLoaded.current = true;
              return;
            }
          }

          // Ширээ хоосон бол сагсыг ачаалах
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
                console.log(
                  "Сагс амжилттай ачаалагдлаа:",
                  parsedCart.length,
                  "зүйл"
                );
              }
            } catch (error) {
              console.error("Error parsing cart from localStorage:", error);
              setCart([]);
              localStorage.removeItem("qr-menu-cart");
              localStorage.removeItem("qr-menu-timestamp");
            }
          }
        } catch (error) {
          console.error("Error checking table status:", error);
          // Алдаа гарвал сагсыг цэвэрлэх
          setCart([]);
          localStorage.removeItem("qr-menu-cart");
          localStorage.removeItem("qr-menu-table-number");
          localStorage.removeItem("qr-menu-timestamp");
        }
        cartLoaded.current = true;
      };

      checkTableStatus();
    }
  }, [tableNumber]);

  // Detect table number from URL parameters and check table status immediately
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const table = urlParams.get("table");

      // Хэрэв ширээний дугаар өөрчлөгдсөн бол сагсыг цэвэрлэх
      const storedTableNumber = localStorage.getItem("qr-menu-table-number");
      if (table !== storedTableNumber) {
        console.log(
          `URL-аас ширээний дугаар өөрчлөгдсөн: ${storedTableNumber} -> ${table}, сагсыг цэвэрлэх`
        );
        setCart([]);
        localStorage.removeItem("qr-menu-cart");
        localStorage.removeItem("qr-menu-table-number");
        localStorage.removeItem("qr-menu-timestamp");
        setTableAvailable(null); // Ширээний статусыг reset хийх
      }

      setTableNumber(table);

      // Ширээний дугаарыг localStorage-д хадгалах
      if (table) {
        localStorage.setItem("qr-menu-table-number", table);

        // Ширээний статусыг шууд шалгах
        checkTableStatusImmediately(table);
      }
    }
  }, []);

  // Ширээний статусыг шууд шалгах функц
  const checkTableStatusImmediately = async (tableNum: string) => {
    try {
      console.log("Ширээний статусыг шууд шалгаж байна:", tableNum);
      const response = await fetch(
        `${API_BASE_URL}/api/tables?number=${tableNum}`
      );
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const table = data.data[0];
        console.log("Ширээний статус:", table.status);
        console.log("Ширээний currentOrder:", table.currentOrder);

        // Ширээний статусыг шалгах
        console.log("Ширээний дэлгэрэнгүй мэдээлэл:", {
          status: table.status,
          currentOrder: table.currentOrder,
          hasCurrentOrder: !!table.currentOrder,
          tableNumber: tableNum,
        });

        // Хэрэв ширээ захиалгатай бол шууд мэдэгдэл өгөх
        if (table.status === "reserved") {
          console.log("Ширээ захиалгатай байна - сагсанд хоол нэмэх боломжгүй");
          setTableAvailable(false); // Ширээ ашиглах боломжгүй
          toast({
            title: getText(
              "🚫 Table Occupied",
              "🚫 Ширээ захиалгатай",
              "🚫 テーブルは使用中"
            ),
            description: getText(
              "This table has an active order. Please wait for the table to become available, or place your order at another available table. Thank you.",
              "Энэ ширээ идэвхтэй захиалгатай байна. Та ширээ сулрахыг хүлээнэ үү. Эсвэл өөр сул ширээнд захиалга өгнө үү. Баярлалаа",
              "このテーブルは使用中です。テーブルが空くまでお待ちいただくか、他の空いているテーブルでご注文ください。ありがとうございます。"
            ),
            variant: "destructive",
            duration: 8000,
          });

          // Сагсыг цэвэрлэх
          setCart([]);
          localStorage.removeItem("qr-menu-cart");
          localStorage.removeItem("qr-menu-table-number");
          localStorage.removeItem("qr-menu-timestamp");
          cartLoaded.current = true;
        } else {
          // Ширээ хоосон бол ашиглах боломжтой
          setTableAvailable(true);
          console.log("Ширээ хоосон байна - ашиглах боломжтой");
        }
      }
    } catch (error) {
      console.error("Error checking table status immediately:", error);
    }
  };

  // Persist cart to localStorage with timestamp
  useEffect(() => {
    if (cartLoaded.current) {
      localStorage.setItem("qr-menu-cart", JSON.stringify(cart));
      // Ширээний дугаарыг бас хадгалах
      if (tableNumber) {
        localStorage.setItem("qr-menu-table-number", tableNumber);
        // Хугацааны мэдээллийг хадгалах
        localStorage.setItem("qr-menu-timestamp", Date.now().toString());
      }
    }
  }, [cart, tableNumber]);

  useEffect(() => {
    // Ensure skeleton shows for at least 1.5 seconds for better UX
    const startTime = Date.now();
    const minLoadingTime = 1500; // 1.5 seconds minimum

    setFetchingData(true);

    // Fetch menu items, categories, and restaurant settings
    Promise.all([
      fetch(`${API_BASE_URL}/api/menu`),
      fetch(`${API_BASE_URL}/api/categories`),
      fetch(`${API_BASE_URL}/api/restaurant`),
    ])
      .then((responses) => Promise.all(responses.map((res) => res.json())))
      .then(([menuData, categoriesData, restaurantData]) => {
        if (menuData.success) {
          setMenuItems(menuData.data);
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }

        if (restaurantData.success) {
          // Store restaurant data and update name
          const restaurant = restaurantData.data;
          console.log("Restaurant data loaded:", restaurant);
          setRestaurantData(restaurant);
          updateRestaurantName(restaurant);
        } else {
          console.error("Failed to load restaurant data:", restaurantData);
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
  }, [currentLanguage]);

  // Effect to update restaurant name when language changes
  useEffect(() => {
    if (restaurantData) {
      updateRestaurantName(restaurantData);
    }
  }, [currentLanguage, restaurantData]);

  // Group menu items by category and sort by category order (matching admin panel)
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

  const addToCart = (item: {
    _id: string;
    nameEn: string;
    nameMn: string;
    nameJa: string;
    price: string | number;
    image?: string;
  }) => {
    // Ширээ сонгоогүй бол мэдэгдэл өгөх
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

    // Ширээ ашиглах боломжгүй бол мэдэгдэл өгөх
    if (tableAvailable === false) {
      toast({
        title: getText(
          "❌ Cannot Add Items",
          "❌ Бараа нэмэх боломжгүй",
          "❌ 商品を追加できません"
        ),
        description: getText(
          "This table has an active order. Please wait for the table to become available, or place your order at another available table. Thank you.",
          "Энэ ширээ идэвхтэй захиалгатай байна. Та ширээ сулрахыг хүлээнэ үү. Эсвэл өөр сул ширээнд захиалга өгнө үү. Баярлалаа",
          "このテーブルは使用中です。テーブルが空くまでお待ちいただくか、他の空いているテーブルでご注文ください。ありがとうございます。"
        ),
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Ширээ ашиглах боломжтой бол сагсанд нэмэх
    addItemToCart(item);
  };

  // Сагсанд бараа нэмэх үндсэн функц
  const addItemToCart = (item: any) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === item._id);
      const originalPrice =
        typeof item.price === "string"
          ? parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0
          : typeof item.price === "number" && !isNaN(item.price)
          ? item.price
          : 0;

      // Apply discount if before 7pm
      const finalPrice = isBefore7PM()
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
          nameJa: item.nameJa,
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

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Захиалга илгээх функц
  const handlePlaceOrder = async () => {
    console.log("handlePlaceOrder дуудагдаж байна");
    console.log("tableNumber:", tableNumber);
    console.log("cart:", cart);

    // Ширээ сонгоогүй бол мэдэгдэл өгөх
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

    // Сагс хоосон бол мэдэгдэл өгөх
    if (cart.length === 0) {
      toast({
        title: getText("Error", "Алдаа", "エラー"),
        description: getText(
          "Please add items to cart",
          "Сагсанд бараа нэмнэ үү",
          "カートに商品を追加してください"
        ),
        variant: "destructive",
      });
      return;
    }

    // Ширээ ашиглах боломжгүй бол мэдэгдэл өгөх
    if (tableAvailable === false) {
      toast({
        title: getText(
          "❌ Cannot Place Order",
          "❌ Захиалга өгөх боломжгүй",
          "❌ 注文できません"
        ),
        description: getText(
          "This table has an active order. Please wait for the table to become available, or place your order at another available table. Thank you.",
          "Энэ ширээ идэвхтэй захиалгатай байна. Та ширээ сулрахыг хүлээнэ үү. Эсвэл өөр сул ширээнд QR код уншуулж захиалга өгнө үү. Баярлалаа",
          "このテーブルは使用中です。テーブルが空くまでお待ちいただくか、他の空いているテーブルでご注文ください。ありがとうございます。"
        ),
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setIsSubmitting(true);
    console.log("API_BASE_URL:", API_BASE_URL);

    // API дуудалтын мэдээллийг toast-оор харуулах
    toast({
      title: "API Call",
      description: `Fetching table data for table ${tableNumber}...`,
      duration: 2000,
    });

    try {
      // Ширээний ID-г олох
      console.log("Ширээний ID хайж байна:", tableNumber);
      const tableResponse = await fetch(
        `${API_BASE_URL}/api/tables?number=${tableNumber}`
      );
      const tableData = await tableResponse.json();
      console.log("Ширээний мэдээлэл:", tableData);

      // Ширээний мэдээллийг alert-оор харуулах
      alert(
        `Table Response: Success ${tableData.success}, Found ${
          tableData.data?.length || 0
        } tables`
      );

      // Ширээний мэдээллийг toast-оор харуулах
      toast({
        title: "Table Response",
        description: `Success: ${tableData.success}, Found: ${
          tableData.data?.length || 0
        } tables`,
        duration: 2000,
      });

      if (
        !tableData.success ||
        !tableData.data ||
        tableData.data.length === 0
      ) {
        toast({
          title: getText("Error", "Алдаа", "エラー"),
          description: getText(
            "Table not found",
            "Ширээ олдсонгүй",
            "テーブルが見つかりません"
          ),
          variant: "destructive",
        });
        return;
      }

      const table = tableData.data[0];
      const tableId = table._id;
      console.log("Ширээний ID:", tableId);

      // Захиалгын өгөгдлийг бэлтгэх
      const orderData = {
        tableId,
        items: cart.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total,
        customerName: "", // QR menu-гээс хоосон string
        customerPhone: "", // QR menu-гээс хоосон string
        specialRequests: "", // QR menu-гээс хоосон string
      };
      console.log("Захиалгын өгөгдөл:", orderData);

      // Backend-рүү захиалга илгээх
      console.log("Backend-рүү захиалга илгээж байна...");

      // Захиалга илгээх мэдээллийг toast-оор харуулах
      toast({
        title: "Sending Order",
        description: `Sending order with ${cart.length} items to backend...`,
        duration: 2000,
      });

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      console.log("API response status:", response.status);

      // Response status-г alert-оор харуулах
      alert(`Order Response: Status ${response.status} ${response.statusText}`);

      // Response status-г toast-оор харуулах
      toast({
        title: "Order Response",
        description: `Status: ${response.status} ${response.statusText}`,
        duration: 3000,
      });

      // Response body-г шалгах
      const responseText = await response.text();
      console.log("Response body:", responseText);

      // Response body-г alert-оор харуулах
      alert(`Response body: ${responseText}`);

      if (response.ok) {
        const responseData = JSON.parse(responseText);

        // Амжилттай мэдээлэл
        toast({
          title: getText("Success!", "Амжилттай!", "成功！"),
          description: getText(
            "Your order has been placed successfully!",
            "Таны захиалга амжилттай илгээгдлээ!",
            "注文が正常に送信されました！"
          ),
        });

        // Сагсыг цэвэрлэх
        setCart([]);
        localStorage.removeItem("qr-menu-cart");
        localStorage.removeItem("qr-menu-table-number");
        localStorage.removeItem("qr-menu-timestamp");
        setCartOpen(false);
        setTableAvailable(false); // Захиалга амжилттай бол ширээ ашиглах боломжгүй болгох
      } else {
        const errorData = JSON.parse(responseText);
        console.error("API алдаа:", errorData);

        // Илүү дэлгэрэнгүй error message харуулах
        const errorMessage =
          errorData.error || errorData.message || "Unknown error";
        const errorDetails = errorData.details
          ? JSON.stringify(errorData.details)
          : "";

        // console.error("Error details:", {
        //   message: errorMessage,
        //   details: errorDetails,
        //   status: response.status,
        //   statusText: response.statusText,
        // });

        toast({
          title: getText("Error", "Алдаа", "エラー"),
          description: `${getText(
            "Failed to place order. Please try again.",
            "Захиалга илгээхэд алдаа гарлаа. Дахин оролдоно уу.",
            "注文の送信に失敗しました。もう一度お試しください。"
          )} (${errorMessage})`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Захиалга үүсгэхэд алдаа гарлаа:", error);

      toast({
        title: getText("Error", "Алдаа", "エラー"),
        description: getText(
          "Network error. Please check your connection.",
          "Сүлжээний алдаа. Холболтоо шалгана уу.",
          "ネットワークエラー。接続を確認してください。"
        ),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF7D1" }}>
      {/* Header */}
      <div
        className="p-4 text-center md:p-6"
        style={{ backgroundColor: "#FFD09B" }}
      >
        <h1
          className="mb-2 text-2xl font-bold md:text-4xl"
          style={{ color: "#8B4513" }}
        >
          {restaurantName}
        </h1>
        <p className="mb-4 text-sm text-gray-700 md:text-base">
          {getRestaurantDescription()}
        </p>

        {/* Language Selector */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex p-1 bg-white rounded-lg shadow-md">
            {[
              { code: "en", name: "English", flag: "🇺🇸" },
              { code: "mn", name: "Монгол", flag: "🇲🇳" },
              { code: "ja", name: "日本語", flag: "🇯🇵" },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() =>
                  setCurrentLanguage(lang.code as "en" | "mn" | "ja")
                }
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  currentLanguage === lang.code
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table Number Display */}
        {tableNumber && (
          <div className="mt-2">
            <Badge
              variant="secondary"
              style={{ backgroundColor: "#FFB0B0", color: "#8B4513" }}
              className="text-xs font-bold md:text-sm"
            >
              Table {tableNumber}
            </Badge>
          </div>
        )}
      </div>

      {/* Discount Banner */}
      {isBefore7PM() && (
        <div className="container px-4 py-2 mx-auto">
          <div className="px-4 py-3 text-center text-white rounded-lg shadow-lg bg-gradient-to-r from-yellow-400 to-orange-400">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">🎉</span>
              <span className="text-lg font-bold">
                {getText("Happy Hour!", "Хөгжөөний цаг!", "ハッピーアワー！")}
              </span>
              <span className="text-sm">
                {getText(
                  "10% OFF all items before 7:00 PM",
                  "19:00 цагийн өмнөх бүх бараанд 10% хөнгөлөлт",
                  "19:00までの全商品10%オフ"
                )}
              </span>
              <span className="text-lg">🎉</span>
            </div>
          </div>
        </div>
      )}

      {/* Menu Content */}
      <div className="container max-w-4xl px-4 py-4 mx-auto md:py-6">
        {loadingMenu || Object.keys(groupedMenu).length === 0 ? (
          <div className="w-full space-y-12">
            {/* Loading indicator */}
            <div className="py-8 text-center">
              <div className="inline-flex items-center space-x-2 text-gray-600">
                <div className="w-6 h-6 border-b-2 border-orange-500 rounded-full animate-spin"></div>
                <span className="text-lg">Loading delicious menu items...</span>
              </div>
            </div>

            {/* Skeleton loading */}
            {[
              "appetizers",
              "sushi",
              "ramen",
              "main dishes",
              "desserts",
              "drinks",
            ].map((category) => (
              <CategorySkeleton key={category} />
            ))}
          </div>
        ) : (
          <>
            {/* Subtle loading indicator after skeleton */}
            {fetchingData && (
              <div className="py-4 mb-6 text-center">
                <div className="inline-flex items-center space-x-2 text-gray-500">
                  <div className="w-4 h-4 border-b-2 border-orange-400 rounded-full animate-spin"></div>
                  <span className="text-sm">Finalizing menu...</span>
                </div>
              </div>
            )}

            {/* Actual menu content */}
            <div className="w-full space-y-12">
              {Object.entries(groupedMenu).map(([category, items]) => (
                <div key={category} className="space-y-6 md:space-y-8">
                  <div className="mb-6 md:mb-8">
                    <div className="flex items-center gap-3">
                      {React.createElement(getCategoryIcon(category), {
                        className: "w-8 h-8 text-gray-700",
                      })}
                      <h2 className="text-2xl font-bold text-gray-900 capitalize md:text-3xl">
                        {category}
                      </h2>
                    </div>
                  </div>

                  <div className="grid items-start grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                    {items.map((item, index) => (
                      <Card
                        key={item._id || index}
                        className="flex flex-col h-full p-0 overflow-hidden transition-all duration-200 bg-white border-0 rounded-lg shadow-xl hover:shadow-2xl"
                        style={{
                          boxShadow:
                            "8px 8px 16px rgba(0, 0, 0, 0.15), 4px 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <CardContent className="flex flex-col h-full p-0">
                          <div className="relative flex-shrink-0">
                            {item.image ? (
                              <CloudinaryImage
                                src={item.image}
                                alt={item.nameEn || item.name}
                                width={300}
                                height={200}
                                className="object-cover w-full h-32 rounded-t-lg md:h-48"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-32 bg-gray-200 rounded-t-lg md:h-48">
                                <span className="text-sm text-gray-500">
                                  No image
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col flex-grow p-2 md:p-4">
                            <div className="flex items-center justify-between mb-1 md:mb-2">
                              <h3 className="text-sm font-bold text-gray-900 md:text-lg">
                                {getText(
                                  item.nameEn || item.name,
                                  item.nameMn || item.name,
                                  item.nameJa || item.nameEn || item.name
                                )}
                              </h3>
                              <div className="flex flex-col items-end">
                                {isBefore7PM() ? (
                                  <>
                                    <span className="text-xs text-gray-500 line-through">
                                      $
                                      {typeof item.price === "number"
                                        ? item.price.toFixed(2)
                                        : item.price}
                                    </span>
                                    <Badge
                                      style={{
                                        backgroundColor: "#FFB0B0",
                                        color: "#8B4513",
                                      }}
                                      className="px-2 py-1 text-xs font-bold md:text-sm md:px-3"
                                    >
                                      $
                                      {typeof item.price === "number"
                                        ? getDiscountedPrice(
                                            item.price
                                          ).toFixed(2)
                                        : item.price}
                                    </Badge>
                                  </>
                                ) : (
                                  <Badge
                                    style={{
                                      backgroundColor: "#FFB0B0",
                                      color: "#8B4513",
                                    }}
                                    className="px-2 py-1 text-xs font-bold md:text-sm md:px-3"
                                  >
                                    $
                                    {typeof item.price === "number"
                                      ? item.price.toFixed(2)
                                      : item.price}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <p className="flex-grow mb-2 text-xs leading-relaxed text-gray-600 md:text-sm md:mb-4 line-clamp-2">
                              {getText(
                                item.descriptionEn || item.description,
                                item.descriptionMn || item.description,
                                item.descriptionJa ||
                                  item.descriptionEn ||
                                  item.description
                              )}
                            </p>
                            <Button
                              size="sm"
                              style={{
                                backgroundColor: "#FFD09B",
                                color: "#8B4513",
                              }}
                              className="w-full py-1 mt-auto text-xs font-medium hover:opacity-80 md:text-sm md:py-2"
                              onClick={() => addToCart(item)}
                            >
                              {getText(
                                "Add to Cart",
                                "Сагсанд нэмэх",
                                "カートに追加"
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {/* Floating Cart Button */}
        {pathname !== "/admin" && (
          <Button
            className="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-50 shadow-lg px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base"
            style={{
              display: cart.length ? "block" : "none",
              backgroundColor: "#FFB0B0",
              color: "#8B4513",
            }}
            onClick={() => setCartOpen(true)}
          >
            {getText("View Cart", "Сагс харах", "カートを見る")} (
            {cart.reduce((sum, i) => sum + i.quantity, 0)})
          </Button>
        )}
        {/* Cart Modal */}
        <Dialog open={cartOpen} onOpenChange={setCartOpen}>
          <DialogContent className="max-w-lg w-[95vw] md:max-w-lg max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                {getText("Your Order", "Таны захиалга", "ご注文")}
                {tableNumber && (
                  <div className="mt-1 text-sm text-gray-600">
                    Table {tableNumber}
                  </div>
                )}
              </DialogTitle>
              <div className="text-sm text-center text-gray-500">
                {getText(
                  `${cart.length} item${cart.length !== 1 ? "s" : ""} in cart`,
                  `Сагсанд ${cart.length} бараа`,
                  `カートに${cart.length}アイテム`
                )}
              </div>
            </DialogHeader>
            {cart.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <div className="mb-2 text-4xl">🛒</div>
                <div className="mb-2 text-lg font-medium">
                  {getText(
                    "Your cart is empty",
                    "Таны сагс хоосон байна",
                    "カートが空です"
                  )}
                </div>
                <div className="text-sm">
                  {getText(
                    "Add some delicious items to get started!",
                    "Вкусхан зүйлс нэмж эхлээрэй!",
                    "おいしい商品を追加して始めましょう！"
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-[60vh]">
                {/* Scrollable food items */}
                <div className="flex-1 pr-2 space-y-4 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b"
                    >
                      <CloudinaryImage
                        src={item.image || ""}
                        alt={getText(item.nameEn, item.nameMn, item.nameJa)}
                        width={80}
                        height={80}
                        className="flex-shrink-0 object-cover w-20 h-20 rounded-lg shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="mb-1 text-base font-semibold">
                          {getText(item.nameEn, item.nameMn, item.nameJa)}
                        </div>
                        <div className="mb-2 text-sm text-gray-600">
                          $
                          {typeof item.price === "number" && !isNaN(item.price)
                            ? item.price.toFixed(2)
                            : "0.00"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              changeQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity === 1}
                            className="w-8 h-8 p-0"
                          >
                            -
                          </Button>
                          <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              changeQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Sticky total and buttons section */}
                <div className="sticky bottom-0 pt-4 bg-white border-t">
                  <div className="flex items-center justify-between mb-4 text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCart([]);
                        localStorage.removeItem("qr-menu-cart");
                        localStorage.removeItem("qr-menu-table-number");
                        localStorage.removeItem("qr-menu-timestamp");
                      }}
                      className="flex-1 py-3 text-base font-medium text-red-600 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300"
                    >
                      {getText(
                        "Empty Cart",
                        "Сагсыг цэвэрлэх",
                        "カートを空にする"
                      )}
                    </Button>
                    <Button
                      className="flex-1 py-3 text-base font-medium rounded-lg"
                      style={{ backgroundColor: "#FFD09B", color: "#8B4513" }}
                      onClick={() => {
                        console.log("Place Order товч даргдлаа");
                        handlePlaceOrder();
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? getText(
                            "Submitting...",
                            "Илгээж байна...",
                            "送信中..."
                          )
                        : getText("Place Order", "Захиалга өгөх", "注文する")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Footer */}
        <div className="pt-6 mt-12 text-sm text-center text-gray-500 border-t">
          <p className="mb-2">
            {getText(
              "Thank you for dining with us!",
              "Бидэнтэй хооллохдод баярлалаа!",
              "ご利用いただきありがとうございます！"
            )}
          </p>
          <p>
            {getText(
              "Please let your server know about any allergies or dietary restrictions",
              "Аллерги эсвэл хоолны хязгаарлалттай бол үйлчилгээний ажилтанд мэдэгдээрэй",
              "アレルギーや食事制限がある場合は、スタッフにお知らせください"
            )}
          </p>
          <div className="mt-4 text-xs">
            <p>WiFi: {restaurantName}_Guest | Password: sushi2024</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 md:mt-16" style={{ backgroundColor: "#FFD09B" }}>
        <div className="container px-4 py-8 mx-auto md:py-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
            <div>
              <h3
                className="mb-3 text-lg font-bold md:text-xl md:mb-4"
                style={{ color: "#8B4513" }}
              >
                {restaurantName}
              </h3>
              <p className="text-xs text-gray-700 md:text-sm">
                Experience the perfect blend of tradition and innovation
              </p>
            </div>
            <div>
              <h4
                className="mb-3 font-semibold md:mb-4"
                style={{ color: "#8B4513" }}
              >
                Hours
              </h4>
              <div className="space-y-1 text-xs text-gray-700 md:text-sm">
                {restaurantData?.operatingHours ? (
                  restaurantData.operatingHours.map(
                    (hours: any, index: number) => (
                      <div key={index}>
                        {hours.day}: {hours.openTime} - {hours.closeTime}
                      </div>
                    )
                  )
                ) : (
                  <>
                    <div>Mon-Thu: 11:00 AM - 10:00 PM</div>
                    <div>Fri-Sat: 11:00 AM - 12:00 PM</div>
                    <div>Sunday: 12:00 PM - 9:00 PM</div>
                  </>
                )}
              </div>
            </div>
            <div>
              <h4
                className="mb-3 font-semibold md:mb-4"
                style={{ color: "#8B4513" }}
              >
                Location
              </h4>
              <div className="text-xs text-gray-700 md:text-sm">
                <div>{restaurantData?.addressEn || "123 Fusion Street"}</div>
                <div>Downtown District</div>
                <div>Phone: {restaurantData?.phone || "(555) 123-4567"}</div>
              </div>
            </div>
            <div>
              <h4
                className="mb-3 font-semibold md:mb-4"
                style={{ color: "#8B4513" }}
              >
                Follow Us
              </h4>
              <div className="flex space-x-3 text-xs md:space-x-4 md:text-sm">
                <span className="text-gray-700 cursor-pointer hover:text-gray-900">
                  Instagram
                </span>
                <span className="text-gray-700 cursor-pointer hover:text-gray-900">
                  Facebook
                </span>
                <span className="text-gray-700 cursor-pointer hover:text-gray-900">
                  Twitter
                </span>
              </div>
            </div>
          </div>
          <div className="pt-6 mt-6 text-center border-t border-gray-400 md:mt-8 md:pt-8">
            <p className="text-xs text-gray-600 md:text-sm">
              © 2024 {restaurantName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

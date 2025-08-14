"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, ShoppingCart, X } from "lucide-react";

// Menu item интерфейс
interface MenuItem {
  _id: string;
  name: string;
  nameEn: string;
  nameMn?: string;
  nameJp?: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
}

// Cart item интерфейс
interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

// Create Order Modal Props
interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: {
    tableId: string;
    items: {
      menuItemId: string;
      quantity: number;
      price: number;
      specialInstructions?: string;
    }[];
    total: number;
  }) => Promise<{ success: boolean }>;
  tableId: string;
  tableNumber: number;
  menuItems: MenuItem[];
}

export function CreateOrderModal({
  isOpen,
  onClose,
  onSubmit,
  tableId,
  tableNumber,
  menuItems,
}: CreateOrderModalProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Категориудыг цэвэрлэх
  const categories = Array.from(
    new Set(menuItems.map((item) => item.category))
  ).filter(
    (category) =>
      category && typeof category === "string" && category.trim() !== ""
  );

  // Категориар шүүх
  const filteredMenuItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  // Cart-д item нэмэх
  const addToCart = (menuItem: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.menuItem._id === menuItem._id
      );

      if (existingItem) {
        // Хэрэв байвал тоо хэмжээг нэмэх
        return prevCart.map((item) =>
          item.menuItem._id === menuItem._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Шинэ item нэмэх
        return [
          ...prevCart,
          {
            menuItem,
            quantity: 1,
            price: menuItem.price,
          },
        ];
      }
    });
  };

  // Cart-аас item хасах
  const removeFromCart = (menuItemId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.menuItem._id !== menuItemId)
    );
  };

  // Тоо хэмжээг өөрчлөх
  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.menuItem._id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  // Нийт дүнг тооцоолох
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Modal хаагдах үед cart цэвэрлэх
  useEffect(() => {
    if (!isOpen) {
      setCart([]);
      setSelectedCategory("all");
    }
  }, [isOpen]);

  // Захиалга илгээх
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    try {
      // Cart-ыг backend-ийн хүлээж буй форматтай болгох
      const formattedItems = cart.map((item) => ({
        menuItemId: item.menuItem._id,
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.specialInstructions,
      }));

      console.log("Захиалгын өгөгдөл:", {
        tableId,
        items: formattedItems,
        total,
      });

      const result = await onSubmit({
        tableId,
        items: formattedItems,
        total,
      });

      console.log("Захиалгын үр дүн:", result);

      if (result.success) {
        setCart([]);
        onClose();
      }
    } catch (error) {
      console.error("Захиалга үүсгэхэд алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Захиалга үүсгэх - Ширээ {tableNumber}</DialogTitle>
          <DialogDescription>
            Хоолнуудыг сонгоод сагсанд нэмнэ үү
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6 h-[60vh] overflow-hidden">
          {/* Зүүн тал - Хоолнуудын жагсаалт */}
          <div className="flex-[3] overflow-y-auto">
            {/* Категори шүүлт */}
            <div className="mb-4">
              <Label className="block mb-2 text-sm font-medium">Ангилал:</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  Бүгд
                </Button>
                {categories.map((category, index) => (
                  <Button
                    key={`${category}-${index}`}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Хоолнуудын жагсаалт */}
            <div className="space-y-3">
              {filteredMenuItems.map((menuItem) => (
                <Card key={menuItem._id} className="p-3">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Button
                        size="sm"
                        onClick={() => addToCart(menuItem)}
                        className="w-8 h-8 p-0 absolute top-0 right-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 pr-10">
                        <div className="text-lg font-semibold">
                          {menuItem.nameMn || menuItem.name}
                        </div>
                        {menuItem.nameJp && (
                          <div className="text-sm text-gray-500">
                            {menuItem.nameJp}
                          </div>
                        )}
                        {menuItem.description && (
                          <div className="mt-1 text-sm text-gray-600">
                            {menuItem.description}
                          </div>
                        )}
                        <div className="mt-1 text-lg font-bold text-green-600">
                          ${menuItem.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Баруун тал - Сагс */}
          <div className="flex flex-col pl-6 border-l border-gray-200 w-80">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Сагс</h3>
              {cart.length > 0 && (
                <Badge variant="secondary">{cart.length}</Badge>
              )}
            </div>

            {/* Сагсны жагсаалт */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  Сагс хоосон байна
                </div>
              ) : (
                cart.map((item) => (
                  <Card key={item.menuItem._id} className="p-3">
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">
                            {item.menuItem.nameMn || item.menuItem.name}
                          </div>
                          {item.menuItem.nameJp && (
                            <div className="text-xs text-gray-500">
                              {item.menuItem.nameJp}
                            </div>
                          )}
                          <div className="text-sm font-semibold text-green-600">
                            ${item.price.toLocaleString()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.menuItem._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Тоо хэмжээ удирдлага */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.menuItem._id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 font-semibold text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.menuItem._id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <span className="ml-auto font-semibold">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Нийт дүн */}
            {cart.length > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Нийт дүн:</span>
                  <span className="text-green-600">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Цуцлах
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={cart.length === 0 || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Үүсгэж байна..." : "Захиалга үүсгэх"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

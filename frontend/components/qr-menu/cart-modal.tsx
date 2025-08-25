"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CloudinaryImage from "@/components/CloudinaryImage";
import { useLanguage } from "@/contexts/language-context";
import { formatPrice } from "@/components/admin/utils/price-utils";

interface CartModalProps {
  cart: any[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  tableNumber: string | null;
  total: number;
  isSubmitting: boolean;
  onRemoveFromCart: (id: string) => void;
  onChangeQuantity: (id: string, quantity: number) => void;
  onClearCart: () => void;
  onSubmitOrder: () => void;
}

export function CartModal({
  cart,
  cartOpen,
  setCartOpen,
  tableNumber,
  total,
  isSubmitting,
  onRemoveFromCart,
  onChangeQuantity,
  onClearCart,
  onSubmitOrder,
}: CartModalProps) {
  const { getText } = useLanguage();

  return (
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
                    alt={getText(item.nameEn, item.nameMn, item.nameJp)}
                    width={80}
                    height={80}
                    className="flex-shrink-0 object-cover w-20 h-20 rounded-lg shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 text-base font-semibold">
                      {getText(item.nameEn, item.nameMn, item.nameJp)}
                    </div>
                    <div className="mb-2 text-sm text-gray-600">
                      {typeof item.price === "number" && !isNaN(item.price)
                        ? formatPrice(item.price)
                        : "0 ₮"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (item.quantity === 1) {
                            onRemoveFromCart(item.id);
                          } else {
                            onChangeQuantity(item.id, item.quantity - 1);
                          }
                        }}
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
                          onChangeQuantity(item.id, item.quantity + 1)
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
                    onClick={() => onRemoveFromCart(item.id)}
                    className="p-4 text-red-500 hover:text-red-700 hover:bg-red-50 text-2xl font-bold w-12 h-12"
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
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClearCart}
                  className="flex-1 py-3 text-base font-medium text-red-600 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300"
                >
                  {getText("Empty Cart", "Сагсыг цэвэрлэх", "カートを空にする")}
                </Button>
                <Button
                  className="flex-1 py-3 text-base font-medium rounded-lg"
                  style={{ backgroundColor: "#FFD09B", color: "#8B4513" }}
                  onClick={onSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? getText("Submitting...", "Илгээж байна...", "送信中...")
                    : getText("Place Order", "Захиалга өгөх", "注文する")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

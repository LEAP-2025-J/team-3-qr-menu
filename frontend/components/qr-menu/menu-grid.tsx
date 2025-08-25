"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategorySkeleton } from "@/components/ui/loading-skeleton";
import CloudinaryImage from "@/components/CloudinaryImage";
import { useLanguage } from "@/contexts/language-context";
import { formatPrice } from "@/components/admin/utils/price-utils";
import { ChefHat, Fish, Soup, Beef, Coffee } from "lucide-react";

interface MenuGridProps {
  loadingMenu: boolean;
  groupedMenu: Record<string, any[]>;
  fetchingData: boolean;
  isBefore7PM: boolean;
  getDiscountedPrice: (price: number) => number;
  onAddToCart: (item: any) => void;
  getCartQuantity: (itemId: string) => number;
}

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

export function MenuGrid({
  loadingMenu,
  groupedMenu,
  fetchingData,
  isBefore7PM,
  getDiscountedPrice,
  onAddToCart,
  getCartQuantity,
}: MenuGridProps) {
  const { getText } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("");
  const tabsListRef = useRef<HTMLDivElement>(null);

  // Set default active tab to first category
  useEffect(() => {
    if (Object.keys(groupedMenu).length > 0 && !activeTab) {
      setActiveTab(Object.keys(groupedMenu)[0]);
    }
  }, [groupedMenu, activeTab]);

  if (loadingMenu || Object.keys(groupedMenu).length === 0) {
    return (
      <div className="container max-w-4xl px-4 py-4 mx-auto md:py-6">
        <div className="w-full space-y-12">
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
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4 py-4 mx-auto md:py-6">
      {/* Subtle loading indicator after skeleton */}
      {fetchingData && (
        <div className="py-4 mb-6 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <div className="w-4 h-4 border-b-2 border-orange-400 rounded-full animate-spin"></div>
            <span className="text-sm">Finalizing menu...</span>
          </div>
        </div>
      )}

      {/* Tabbed Menu Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative">
          {/* Mobile scroll hint - removed since we're using wrap now */}
          <TabsList
            className="w-full mb-4 rounded-lg relative category-grid-mobile"
            ref={tabsListRef}
          >
            {Object.keys(groupedMenu).map((category, index) => (
              <TabsTrigger
                key={category}
                value={category}
                className="flex items-center justify-center text-xs data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-yellow-300 data-[state=inactive]:to-yellow-400 data-[state=inactive]:text-gray-800 rounded-lg transition-all duration-200 whitespace-nowrap hover:from-yellow-200 hover:to-yellow-300 hover:shadow-md active:scale-95 active:shadow-inner category-mobile-item px-3 py-2 border border-yellow-200 hover:border-yellow-400 cursor-pointer select-none shadow-sm"
              >
                <span className="capitalize text-xs">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {Object.entries(groupedMenu).map(([category, items]) => (
          <TabsContent key={category} value={category} className="mt-0">
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
                            item.nameJp || item.nameEn || item.name
                          )}
                        </h3>
                        <div className="flex flex-col items-end">
                          {isBefore7PM ? (
                            <>
                              <span className="text-xs text-gray-500 line-through">
                                {typeof item.price === "number"
                                  ? formatPrice(item.price)
                                  : item.price}
                              </span>
                              <Badge
                                style={{
                                  backgroundColor: "#90EE90",
                                  color: "#006400",
                                }}
                                className="px-1 py-0.5 text-xs font-bold md:px-1.5 md:py-0.5"
                              >
                                {typeof item.price === "number"
                                  ? formatPrice(getDiscountedPrice(item.price))
                                  : item.price}
                              </Badge>
                            </>
                          ) : (
                            <Badge
                              style={{
                                backgroundColor: "#90EE90",
                                color: "#006400",
                              }}
                              className="px-1 py-0.5 text-xs font-bold md:px-1.5 md:py-0.5"
                            >
                              {typeof item.price === "number"
                                ? formatPrice(item.price)
                                : item.price}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="flex-grow mb-2 text-xs leading-relaxed text-gray-600 md:text-sm md:mb-4 line-clamp-2">
                        {getText(
                          item.descriptionEn || item.description,
                          item.descriptionMn || item.description,
                          item.descriptionJp ||
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
                        onClick={() => onAddToCart(item)}
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

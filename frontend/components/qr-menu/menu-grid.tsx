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
import { ChefHat, Fish, Soup, Beef, Coffee, ShoppingCart } from "lucide-react";

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
  const { getText, currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("");
  const tabsListRef = useRef<HTMLDivElement>(null);

  // Set default active tab to first category only on initial load
  useEffect(() => {
    if (Object.keys(groupedMenu).length > 0 && !activeTab) {
      // Only set to first category if no tab is currently active
      const firstCategory = Object.keys(groupedMenu)[0];
      if (firstCategory) {
        setActiveTab(firstCategory);
      }
    }
  }, [groupedMenu]);

  // Update active tab when language changes (category names change but keep same position)
  useEffect(() => {
    if (Object.keys(groupedMenu).length > 0 && activeTab) {
      const categories = Object.keys(groupedMenu);
      const currentIndex = categories.findIndex((cat) => cat === activeTab);

      // If current tab doesn't exist in new language, keep the same position
      if (currentIndex === -1 && categories.length > 0) {
        setActiveTab(categories[0]); // fallback to first category
      } else if (currentIndex >= 0) {
        // Keep the same category position but with new language name
        setActiveTab(categories[currentIndex]);
      }
    }
  }, [currentLanguage, groupedMenu]);

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
        <div className="relative mb-2 z-10">
          <TabsList
            className="w-full bg-white/80 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border border-orange-100 grid grid-cols-3 gap-1 min-h-[70px]"
            ref={tabsListRef}
          >
            {Object.keys(groupedMenu).map((category, index) => {
              const IconComponent = getCategoryIcon(category);
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="group relative flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-all duration-300 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-400 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-orange-50 data-[state=inactive]:hover:text-orange-600 whitespace-nowrap select-none min-h-[28px]"
                >
                  <IconComponent className="w-3 h-3 transition-all duration-300" />
                  <span className="capitalize font-medium leading-tight text-[10px]">
                    {category}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {Object.entries(groupedMenu).map(([category, items]) => (
          <TabsContent key={category} value={category} className="mt-1">
            <div className="grid items-start grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {items.map((item, index) => (
                <Card
                  key={item._id || index}
                  className="group flex flex-col h-full p-0 overflow-hidden transition-all duration-300 bg-white border border-orange-100 rounded-2xl shadow-lg hover:shadow-xl hover:border-orange-300"
                >
                  <CardContent className="flex flex-col h-full p-0">
                    <div className="relative flex-shrink-0">
                      {item.image ? (
                        <CloudinaryImage
                          src={item.image}
                          alt={item.nameEn || item.name}
                          width={300}
                          height={200}
                          className="object-cover w-full h-32 rounded-t-2xl md:h-48 transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-t-2xl md:h-48">
                          <span className="text-sm text-orange-400 font-medium">
                            📷 No image
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
                        className="w-full py-3 mt-auto text-xs font-semibold bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-xl hover:from-orange-500 hover:to-amber-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 md:text-sm border-0"
                        onClick={() => onAddToCart(item)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2 text-white" />
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

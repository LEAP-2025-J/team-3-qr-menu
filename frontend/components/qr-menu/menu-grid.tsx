"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategorySkeleton } from "@/components/ui/loading-skeleton";
import CloudinaryImage from "@/components/CloudinaryImage";
import { useLanguage } from "@/contexts/language-context";
import {
  ChefHat,
  Fish,
  Soup,
  Beef,
  Coffee,
} from "lucide-react";

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
                            item.nameJp || item.nameEn || item.name
                          )}
                        </h3>
                        <div className="flex flex-col items-end">
                          {isBefore7PM ? (
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
                                  ? getDiscountedPrice(item.price).toFixed(2)
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
          </div>
        ))}
      </div>
    </div>
  );
} 
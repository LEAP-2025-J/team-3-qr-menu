"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "../utils";

interface MenuItem {
  _id: string;
  name: string;
  nameEn: string;
  nameMn: string;
  nameJp: string;
  description: string;
  descriptionEn: string;
  descriptionMn: string;
  descriptionJp: string;
  price: number;
  category: { name: string; nameEn: string };
  image?: string;
  isAvailable: boolean;
  preparationTime: number;
}

interface UserMenuCardProps {
  item: MenuItem;
}

export const UserMenuCard = ({ item }: UserMenuCardProps) => {
  return (
    <Card className="pt-0 pb-0 transition-all duration-300 hover:shadow-lg hover:scale-105 group relative">
      <div className="relative">
        {/* Хоолны зураг */}
        <div className="aspect-[3/2] overflow-hidden rounded-t-lg">
          <img
            src={item.image || "/placeholder-food.svg"}
            alt={item.nameEn}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-food.svg";
            }}
          />
        </div>

        {/* Status badges */}
        <div className="absolute flex flex-col gap-1 top-3 left-3">
          {!item.isAvailable && (
            <Badge variant="secondary" className="text-xs">
              Боломжгүй
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-3 pt-2 pb-3">
        <div className="space-y-1">
          {/* Хоолны нэр */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {item.nameMn}
              </h3>
              <Badge className="text-sm font-semibold text-white bg-green-600">
                {formatPrice(item.price)}
              </Badge>
            </div>
          </div>

          {/* Тайлбар */}
          {item.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {item.descriptionMn}
            </p>
          )}

          {/* Монгол нэр + хугацаа */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 line-clamp-1">{item.nameJp}</p>
            <span className="text-xs text-gray-500">
              ⏱️ {item.preparationTime} min
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

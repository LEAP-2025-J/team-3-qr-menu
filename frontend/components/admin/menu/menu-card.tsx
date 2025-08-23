"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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

interface MenuCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}

export const MenuCard = ({ item, onEdit, onDelete }: MenuCardProps) => {
  return (
    <Card className="pt-0 pb-0 transition-all duration-300 hover:shadow-lg hover:scale-105 group">
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
              Unavailable
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-3 pt-2">
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

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(item)}
              className="px-2 h-7"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(item._id)}
              className="px-2 h-7"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

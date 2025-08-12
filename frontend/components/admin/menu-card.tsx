"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
  nameEn: string;
  nameMn: string;
  description: string;
  price: number;
  category: { name: string; nameEn: string };
  image?: string;
  isAvailable: boolean;
  isSpicy: boolean;
  preparationTime: number;
}

interface MenuCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}

export const MenuCard = ({ item, onEdit, onDelete }: MenuCardProps) => {
  return (
    <Card className="pt-0 pb-0 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
      <div className="relative">
        {/* Хоолны зураг */}
        <div className="aspect-[3/2] overflow-hidden rounded-t-lg">
          <img
            src={item.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwTDEyMCA4MEwxODAgODBMMTUwIDEwMFoiIGZpbGw9IiNEN0Q5RDEiLz4KPHRleHQgeD0iMTUwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0OTY5QSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Rm9vZCBJbWFnZTwvdGV4dD4KPC9zdmc+"}
            alt={item.nameEn}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwTDEyMCA4MEwxODAgODBMMTUwIDEwMFoiIGZpbGw9IiNEN0Q5RDEiLz4KPHRleHQgeD0iMTUwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0OTY5QSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Rm9vZCBJbWFnZTwvdGV4dD4KPC9zdmc+";
            }}
          />
        </div>

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {!item.isAvailable && (
            <Badge variant="secondary" className="text-xs">
              Unavailable
            </Badge>
          )}
          {item.isSpicy && (
            <Badge variant="destructive" className="text-xs">
              🌶️ Spicy
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-3 pt-2">
        <div className="space-y-1">
          {/* Хоолны нэр */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                {item.nameEn}
              </h3>
              <Badge className="bg-green-600 text-white text-sm font-semibold">
                ${item.price.toFixed(2)}
              </Badge>
            </div>
          </div>

          {/* Тайлбар */}
          {item.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Монгол нэр + хугацаа */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 line-clamp-1">{item.nameMn}</p>
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
              className="h-7 px-2"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(item._id)}
              className="h-7 px-2"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

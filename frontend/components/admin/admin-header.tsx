"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Percent, Clock, Calendar } from "lucide-react";
import { useDiscount } from "@/hooks/use-discount";
import { useBusinessDay } from "@/hooks/use-business-day";

interface AdminHeaderProps {
  notificationCount?: number;
  notificationDialog?: React.ReactNode;
}

export function AdminHeader({
  notificationCount = 0,
  notificationDialog,
}: AdminHeaderProps) {
  const { isDiscountTime, getDiscountInfo } = useDiscount();
  const { isBusinessDayMode } = useBusinessDay();
  const discountInfo = getDiscountInfo();

  return (
    <header className="px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4">
          {/* Business day мэдээлэл */}
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              Бизнес горим:
            </span>
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {isBusinessDayMode ? "ON" : "OFF"}
            </span>
          </div>

          {/* Хөнгөлөлтийн мэдээлэл */}
          {discountInfo && (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-lg">
              <span className="text-sm font-medium text-yellow-800">
                Өнөөдрийн хөнгөлөлт:
              </span>

              <span className="text-sm font-medium text-yellow-800">
                {discountInfo.percentage}%
              </span>
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                {discountInfo.endTime} хүртэл
              </span>
            </div>
          )}

          {notificationDialog ? (
            React.cloneElement(notificationDialog as React.ReactElement, {
              children: (
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <Badge className="absolute flex items-center justify-center w-5 h-5 p-0 text-xs text-white bg-red-500 rounded-full -top-2 -right-2">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              ),
            })
          ) : (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <Badge className="absolute flex items-center justify-center w-5 h-5 p-0 text-xs text-white bg-red-500 rounded-full -top-2 -right-2">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <span className="text-sm font-medium">Админ</span>
          </div>
        </div>
      </div>
    </header>
  );
}

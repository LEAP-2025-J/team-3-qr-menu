"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock } from "lucide-react";
import { useDiscount } from "@/hooks/use-discount";

interface UserHeaderProps {
  notificationCount?: number;
  notificationDialog?: React.ReactNode;
}

export function UserHeader({
  notificationCount = 0,
  notificationDialog,
}: UserHeaderProps) {
  const { isDiscountTime, getDiscountInfo } = useDiscount();
  const discountInfo = getDiscountInfo();

  return (
    <header className="px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4">
          {/* Хөнгөлөлтийн мэдээлэл */}
          {discountInfo && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg">
              <span className="text-sm font-medium text-blue-800">
                Өнөөдрийн хөнгөлөлт:
              </span>

              <span className="text-sm font-medium text-blue-800">
                {discountInfo.percentage}%
              </span>
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">
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
            <div className="w-8 h-8 bg-blue-300 rounded-full"></div>
            <span className="text-sm font-medium">User</span>
          </div>
        </div>
      </div>
    </header>
  );
}

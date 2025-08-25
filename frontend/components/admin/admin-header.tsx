"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

interface AdminHeaderProps {
  notificationCount?: number;
  notificationDialog?: React.ReactNode;
}

export function AdminHeader({
  notificationCount = 0,
  notificationDialog,
}: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4">
          {notificationDialog ? (
            React.cloneElement(notificationDialog as React.ReactElement, {
              children: (
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
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
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
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

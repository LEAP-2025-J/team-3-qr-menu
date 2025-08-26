"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";

interface UserSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function UserSidebar({ activeTab, onTabChange }: UserSidebarProps) {
  const router = useRouter();

  const handleSignOut = () => {
    // Ask for confirmation before signing out
    const isConfirmed = window.confirm("Та гарахдаа итгэлтэй байна уу? (Are you sure you want to sign out?)");
    
    if (isConfirmed) {
      // Clear user session
      localStorage.removeItem("user");
      localStorage.removeItem("username");
      
      // Redirect to sign-in page
      router.push("/sign-in");
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-[210px] bg-white border-r border-gray-200 p-6 flex-shrink-0 z-50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <span className="text-xl font-bold text-gray-900">User</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            className="w-full justify-start text-left overflow-hidden"
            onClick={() => onTabChange("orders")}
          >
            <ShoppingCart className="w-4 h-4 mr-3 flex-shrink-0" />
            <span className="truncate">Захиалгууд</span>
          </Button>

          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className="w-full justify-start text-left overflow-hidden"
            onClick={() => onTabChange("settings")}
          >
            <Settings className="w-4 h-4 mr-3 flex-shrink-0" />
            <span className="text-truncate">Тохиргоо</span>
          </Button>
        </nav>

        {/* Bottom section - Fixed position */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-left overflow-hidden text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
            <span className="truncate">Гарах</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}

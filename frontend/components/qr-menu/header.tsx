"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";

interface HeaderProps {
  restaurantName: string;
  restaurantDescription: string;
  tableNumber: string | null;
}

export function Header({ restaurantName, restaurantDescription, tableNumber }: HeaderProps) {
  const { currentLanguage, setCurrentLanguage, getText } = useLanguage();

  return (
    <div className="p-4 text-center md:p-6" style={{ backgroundColor: "#FFD09B" }}>
      <h1 className="mb-2 text-2xl font-bold md:text-4xl" style={{ color: "#8B4513" }}>
        {restaurantName}
      </h1>
      <p className="mb-4 text-sm text-gray-700 md:text-base">
        {restaurantDescription}
      </p>

      {/* Language Selector */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="flex p-1 bg-white rounded-lg shadow-md">
          {[
            { code: "en", name: "English", flag: "🇺🇸" },
            { code: "mn", name: "Монгол", flag: "🇲🇳" },
            { code: "ja", name: "日本語", flag: "🇯🇵" },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setCurrentLanguage(lang.code as "en" | "mn" | "ja")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                currentLanguage === lang.code
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Table Number Display */}
      {tableNumber && (
        <div className="mt-2">
          <Badge
            variant="secondary"
            style={{ backgroundColor: "#FFB0B0", color: "#8B4513" }}
            className="text-xs font-bold md:text-sm"
          >
            Table {tableNumber}
          </Badge>
        </div>
      )}
    </div>
  );
} 
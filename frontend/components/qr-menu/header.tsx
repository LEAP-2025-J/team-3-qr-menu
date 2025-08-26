"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";

interface HeaderProps {
  restaurantName: string;
  restaurantDescription: string;
  tableNumber: string | null;
}

export function Header({
  restaurantName,
  restaurantDescription,
  tableNumber,
}: HeaderProps) {
  const { currentLanguage, setCurrentLanguage, getText } = useLanguage();

  return (
    <div
      className="relative p-3 text-center md:p-6 overflow-hidden"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dxlufhjua/image/upload/v1756108503/Traditional_Japanese_Pagoda_Surrounded_by_Cherry_Blossoms_at_Sunset_with_Majestic_Mountain_Backdrop_Perfect_for_Travel_Culture_and_Scenic_Landscape_Photography_Stock_Illustration___Adobe_Stock_bxklkp.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        minHeight: "200px",
        position: "relative",
      }}
    >
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>

      {/* Content with relative positioning to appear above the overlay */}
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-3 mb-1 md:mb-2">
          <img
            src="/haku-logo.jpg"
            alt="Haku Logo"
            className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-white shadow-lg"
            style={{
              boxShadow:
                "0 4px 8px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.2)",
            }}
          />
          <h1
            className="text-xl font-bold md:text-4xl text-white drop-shadow-lg"
            style={{
              textShadow:
                "2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.5)",
              fontWeight: "800",
            }}
          >
            {restaurantName}
          </h1>
        </div>
        <p
          className="mb-2 md:mb-4 text-xs md:text-base text-white drop-shadow-md"
          style={{
            textShadow:
              "1px 1px 3px rgba(0,0,0,0.7), 0 0 15px rgba(255,255,255,0.4)",
            fontWeight: "600",
          }}
        >
          {restaurantDescription}
        </p>

        {/* Language Selector */}
        <div className="flex items-center justify-center gap-2 mb-2 md:mb-4">
          <div className="flex p-0.5 bg-white rounded-md shadow-md">
            {[
              { code: "en", name: "English", flag: "🇺🇸" },
              { code: "mn", name: "Монгол", flag: "🇲🇳" },
              { code: "ja", name: "日本語", flag: "🇯🇵" },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() =>
                  setCurrentLanguage(lang.code as "en" | "mn" | "ja")
                }
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  currentLanguage === lang.code
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <span className="mr-1">{lang.flag}</span>
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
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                color: "#1F2937",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
              }}
              className="text-xs font-bold md:text-sm border-2 border-white"
            >
              Table {tableNumber}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

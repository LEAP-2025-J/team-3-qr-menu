"use client";

import { useLanguage } from "@/contexts/language-context";

interface DiscountBannerProps {
  isBefore7PM: boolean;
}

export function DiscountBanner({ isBefore7PM }: DiscountBannerProps) {
  const { getText } = useLanguage();

  if (!isBefore7PM) return null;

  return (
    <div className="container px-4 py-1 mx-auto">
      <div className="px-3 py-2 text-center text-white rounded-lg shadow-lg bg-gradient-to-r from-yellow-400 to-orange-400">
        <div className="flex items-center justify-center gap-1">
          <span className="text-base">🎉</span>
          <span className="text-lg font-bold">
            {getText("Happy Hour!", "Хөгжөөний цаг!", "ハッピーアワー！")}
          </span>
          <span className="text-sm">
            {getText(
              "10% OFF all items before 7:00 PM",
              "19:00 цагийн өмнөх бүх бараанд 10% хөнгөлөлт",
              "19:00までの全商品10%オフ"
            )}
          </span>
          <span className="text-base">🎉</span>
        </div>
      </div>
    </div>
  );
} 
"use client";

import { useDiscount } from "@/hooks/use-discount";
import { useLanguage } from "@/contexts/language-context";

export function DiscountBanner() {
  const { getDiscountInfo } = useDiscount();
  const { getText } = useLanguage();
  const discountInfo = getDiscountInfo();

  if (!discountInfo) {
    return null;
  }

  return (
    <div className="relative w-full p-4 mb-4 overflow-hidden rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400">
      <div className="flex items-center justify-center gap-1s">
        <span className="text-base">🎉</span>
        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="mb-1 text-lg font-bold text-white">
            {getText("Discount Time!", "Хөнгөлөлтийн цаг!", "割引タイム！")}
          </div>
          <div className="text-sm text-white">
            {getText(
              `All dishes ${discountInfo.percentage}% off before ${discountInfo.endTime}`,
              `${discountInfo.endTime} цагаас өмнө бүх хоол ${discountInfo.percentage}% хөнгөлөлттэй`,
              `${discountInfo.endTime}前の全料理${discountInfo.percentage}%割引`
            )}
          </div>
        </div>
        <span className="text-base">🎉</span>
      </div>
    </div>
  );
}

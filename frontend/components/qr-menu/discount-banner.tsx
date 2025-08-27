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
    <div className="relative w-full p-4 mt-2 overflow-hidden rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400">
      <div className="flex items-center justify-center gap-2">
        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="mb-1 text-lg font-bold text-white">
            {/* {getText("Discount Time!", "Хөнгөлөлтийн цаг!", "割引タイム！")} */}
          </div>
          <div className="text-sm text-white">
            <span className="text-xl font-bold">{discountInfo.endTime}</span>{" "}
            {getText("- All dishes", "цагаас өмнө бүх хоол", "前の全料理")}{" "}
            <span className="text-xl font-bold">
              {discountInfo.percentage}%
            </span>{" "}
            {getText("off", "хөнгөлөлттэй", "割引")}
          </div>
        </div>
        <span className="text-4xl font-bold">🎉</span>
      </div>
    </div>
  );
}

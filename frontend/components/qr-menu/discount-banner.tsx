"use client";

import { useDiscount } from "@/hooks/use-discount";

export function DiscountBanner() {
  const { getDiscountInfo } = useDiscount();
  const discountInfo = getDiscountInfo();

  if (!discountInfo) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-lg p-4 mb-4 relative overflow-hidden">
      {/* Confetti decorations */}
      <div className="absolute left-2 bottom-2 w-6 h-6 opacity-60">
        <div className="w-2 h-2 bg-red-500 rounded-full absolute top-0 left-0"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-0 right-0"></div>
        <div className="w-2 h-2 bg-green-500 rounded-full absolute bottom-0 left-0"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full absolute bottom-0 right-0"></div>
      </div>
      <div className="absolute right-2 bottom-2 w-6 h-6 opacity-60">
        <div className="w-2 h-2 bg-pink-500 rounded-full absolute top-0 left-0"></div>
        <div className="w-2 h-2 bg-orange-500 rounded-full absolute top-0 right-0"></div>
        <div className="w-2 h-2 bg-yellow-500 rounded-full absolute bottom-0 left-0"></div>
        <div className="w-2 h-2 bg-indigo-500 rounded-full absolute bottom-0 right-0"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <div className="text-lg font-bold text-white mb-1">
          Хөгжөөний цаг!
        </div>
        <div className="text-sm text-white">
          {discountInfo.endTime} цагийн өмнөх бүх бараанд {discountInfo.percentage}% хөнгөлөлт
        </div>
      </div>
    </div>
  );
} 
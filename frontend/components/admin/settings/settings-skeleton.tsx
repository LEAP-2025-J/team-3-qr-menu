import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Хөнгөлөлтийн тохиргоо - DiscountSettings */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
        <div className="space-y-4">
          <Skeleton className="w-32 h-6" />
          <div className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-full h-10 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-full h-10 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-12 h-4" />
              <div className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="w-16 h-4" />
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <Skeleton className="w-full h-10 rounded" />
          </div>
        </div>
      </div>

      {/* Рестораны мэдээлэл - Restaurant Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
        <div className="space-y-4">
          <Skeleton className="w-40 h-6" />
          <div className="space-y-3">
            {/* Restaurant Names Section */}
            <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="w-24 h-4" />
                <div className="flex space-x-1">
                  <Skeleton className="w-8 h-6 rounded" />
                  <Skeleton className="w-8 h-6 rounded" />
                  <Skeleton className="w-8 h-6 rounded" />
                </div>
              </div>
              <Skeleton className="w-full h-10 rounded" />
            </div>

            {/* Description Section */}
            <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="w-20 h-4" />
                <div className="flex space-x-1">
                  <Skeleton className="w-8 h-6 rounded" />
                  <Skeleton className="w-8 h-6 rounded" />
                  <Skeleton className="w-8 h-6 rounded" />
                </div>
              </div>
              <Skeleton className="w-full h-20 rounded" />
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-full h-10 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-full h-10 rounded" />
            </div>
          </div>
          <div className="mt-auto">
            <Skeleton className="w-full h-10 rounded" />
          </div>
        </div>
      </div>

      {/* Ажиллах цаг - Operating Hours */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
        <div className="space-y-4">
          <Skeleton className="w-32 h-6" />
          <div className="space-y-2 flex-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-20 h-8 rounded" />
                <Skeleton className="w-4 h-4" />
                <Skeleton className="w-20 h-8 rounded" />
                <Skeleton className="w-4 h-4" />
              </div>
            ))}
          </div>
          <div className="mt-auto">
            <Skeleton className="w-full h-10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

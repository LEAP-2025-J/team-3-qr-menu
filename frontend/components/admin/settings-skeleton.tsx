import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-32 h-8" />
      </div>

      {/* Settings Form */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="space-y-6">
          {/* Restaurant Info Section */}
          <div>
            <Skeleton className="w-40 h-6 mb-4" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-full h-10 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-full h-10 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-full h-10 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-full h-10 rounded" />
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div>
            <Skeleton className="w-32 h-6 mb-4" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-full h-10 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-12 h-4" />
                <Skeleton className="w-full h-10 rounded" />
              </div>
            </div>
          </div>

          {/* Business Hours Section */}
          <div>
            <Skeleton className="h-6 mb-4 w-36" />
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-24 h-10 rounded" />
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="w-24 h-10 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Skeleton className="w-24 h-10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

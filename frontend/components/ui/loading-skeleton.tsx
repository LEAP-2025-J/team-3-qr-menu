import { Skeleton } from "./skeleton"

// Menu Item Skeleton - for loading menu items
export function MenuItemSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border-0 shadow-xl bg-white p-0 h-full flex flex-col">
      <div className="p-0 flex flex-col h-full">
        <Skeleton className="w-full h-32 md:h-48 rounded-t-lg" />
        <div className="p-2 md:p-4 flex flex-col flex-grow space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 md:h-6 w-24 md:w-32" />
            <Skeleton className="h-6 w-16 md:w-20" />
          </div>
          <Skeleton className="h-3 md:h-4 w-full" />
          <Skeleton className="h-3 md:h-4 w-3/4" />
          <Skeleton className="h-8 md:h-10 w-full mt-auto" />
        </div>
      </div>
    </div>
  )
}

// Category Skeleton - for loading category sections
export function CategorySkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="mb-6 md:mb-8">
        <Skeleton className="h-8 md:h-10 w-32 md:w-40" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 items-start">
        {[...Array(6)].map((_, index) => (
          <MenuItemSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

// Stats Card Skeleton - for loading dashboard stats
export function StatsCardSkeleton() {
  return (
    <div className="p-6">
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

// Order Row Skeleton - for loading order items
export function OrderRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

// Table Skeleton - for loading table items
export function TableSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}

// QR Code Skeleton - for loading QR codes
export function QRCodeSkeleton() {
  return (
    <div className="text-center">
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-20 mx-auto" />
        <Skeleton className="h-48 w-48 mx-auto rounded-lg" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  )
}

// Upload Progress Skeleton - for loading upload progress
export function UploadProgressSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  )
}

// Admin Tab Skeleton - for loading different admin tabs
export function AdminTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Reservation Skeleton - for loading reservation items
export function ReservationSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex space-x-2 mt-3">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

// Menu Management Skeleton - for loading menu management
export function MenuManagementSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-32 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-16" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
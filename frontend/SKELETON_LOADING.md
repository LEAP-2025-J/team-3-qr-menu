# Skeleton Loading Components

This document explains how to use the skeleton loading components for better user experience during loading and refreshing states.

## Available Components

### 1. MenuItemSkeleton
- **Use case**: Loading individual menu items
- **Features**: Image placeholder, title, price, description, and button skeletons
- **Responsive**: Adapts to mobile and desktop layouts

### 2. CategorySkeleton  
- **Use case**: Loading entire category sections
- **Features**: Category title + 6 menu item skeletons
- **Usage**: Perfect for main menu loading states

### 3. StatsCardSkeleton
- **Use case**: Loading dashboard statistics cards
- **Features**: Title, value, and subtitle skeletons
- **Usage**: Admin dashboard stats loading

### 4. OrderRowSkeleton
- **Use case**: Loading order list items
- **Features**: Avatar, order details, and action buttons
- **Usage**: Orders page loading states

### 5. TableSkeleton
- **Use case**: Loading table management items
- **Features**: Table number, status, and capacity skeletons
- **Usage**: Tables page loading states

### 6. QRCodeSkeleton
- **Use case**: Loading QR code generation
- **Features**: Table number, QR code placeholder, and URL
- **Usage**: QR codes page loading

### 7. UploadProgressSkeleton
- **Use case**: Loading file upload progress
- **Features**: Image preview, filename, and progress
- **Usage**: File upload loading states

### 8. AdminTabSkeleton
- **Use case**: Loading admin tab content
- **Features**: Tab header, search filters, and content grid
- **Usage**: Orders, Tables, and Reservations tabs

### 9. ReservationSkeleton
- **Use case**: Loading reservation items
- **Features**: Reservation details and action buttons
- **Usage**: Reservations management page

### 10. MenuManagementSkeleton
- **Use case**: Loading menu management interface
- **Features**: Menu items grid with images and actions
- **Usage**: Menu management tab

## Usage Examples

### Basic Menu Loading
```tsx
import { CategorySkeleton } from "@/components/ui/loading-skeleton"

{loadingMenu ? (
  <div className="w-full space-y-12">
    {Object.entries(categoryIcons).map(([category]) => (
      <CategorySkeleton key={category} />
    ))}
  </div>
) : (
  // Your actual menu content
)}
```

### Dashboard Stats Loading
```tsx
import { StatsCardSkeleton } from "@/components/ui/loading-skeleton"

{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <Card key={i}>
        <StatsCardSkeleton />
      </Card>
    ))}
  </div>
) : (
  // Your actual stats content
)}
```

### Upload Progress Loading
```tsx
import { UploadProgressSkeleton } from "@/components/ui/loading-skeleton"

{uploading && (
  <div className="space-y-3">
    {[...Array(3)].map((_, index) => (
      <UploadProgressSkeleton key={index} />
    ))}
  </div>
)}
```

### Admin Dashboard Loading
```tsx
import { StatsCardSkeleton, OrderRowSkeleton, AdminTabSkeleton } from "@/components/ui/loading-skeleton"

{loading ? (
  <div className="space-y-6">
    {/* Dashboard Tab */}
    {activeTab === "dashboard" && (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <StatsCardSkeleton />
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <OrderRowSkeleton key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    )}
    
    {/* Other Tabs */}
    {activeTab === "orders" && <AdminTabSkeleton />}
    {activeTab === "tables" && <AdminTabSkeleton />}
    {activeTab === "reservations" && <AdminTabSkeleton />}
    {activeTab === "menu" && <MenuManagementSkeleton />}
  </div>
) : (
  // Your actual admin content
)}
```

## Customization

All skeleton components use the base `Skeleton` component with consistent styling:
- **Colors**: Uses `bg-accent` with `animate-pulse`
- **Spacing**: Follows the design system spacing scale
- **Responsive**: Adapts to mobile/desktop breakpoints
- **Accessibility**: Includes proper ARIA attributes

## Best Practices

1. **Show skeletons immediately** when loading starts
2. **Match skeleton layout** to actual content structure
3. **Use appropriate skeleton types** for different content
4. **Keep loading times reasonable** (1-3 seconds max)
5. **Provide fallback content** for failed loads

## Performance

- Skeletons are lightweight and don't impact performance
- Use `Array.from()` or spread operator for multiple skeletons
- Consider lazy loading for large skeleton lists
- Skeletons automatically clean up when component unmounts 
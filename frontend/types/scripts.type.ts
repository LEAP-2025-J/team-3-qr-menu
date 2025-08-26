// Scripts-д хэрэгтэй type definitions

export interface DatabaseConfig {
  uri: string;
  dbName: string;
}

export interface ScriptResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface Category {
  nameEn: string;
  nameMn: string;
  nameJa: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface MenuItem {
  nameEn: string;
  nameMn: string;
  descriptionEn: string;
  descriptionMn: string;
  price: number;
  image: string;
  ingredients: string[];
  allergens: string[];
  isSpicy: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isAvailable: boolean;
  preparationTime: number;
  calories: number;
  order: number;
  categoryNameEn: string;
}

export interface Table {
  tableNumber: number;
  capacity: number;
  isAvailable: boolean;
  qrCode?: string;
  location?: string;
}

export interface Order {
  orderNumber: string;
  tableNumber: number;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Reservation {
  tableNumber: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: Date;
  reservationTime: string;
  status: "confirmed" | "pending" | "cancelled" | "completed" | "no-show";
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CloudinaryImage {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
}

export interface CloudinaryResult {
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
  result?: any;
}

export interface CleanupResult {
  success: boolean;
  deleted?: {
    completed: number;
    cancelled: number;
    noShow: number;
  };
  error?: string;
}

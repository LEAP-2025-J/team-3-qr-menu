"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TablesGrid } from "./tables-grid";
import {
  RefreshCw,
  Grid,
  List,
  Clock,
  DollarSign,
  Users,
  Plus,
} from "lucide-react";
import { useState } from "react";

// Захиалгын item интерфейс
interface OrderItem {
  menuItem: {
    name: string;
    nameEn: string;
    nameMn?: string;
  };
  quantity: number;
  price: number;
  specialInstructions?: string;
}

// Захиалгын интерфейс
interface Order {
  _id: string;
  orderNumber: string;
  status:
    | "pending"
    | "preparing"
    | "serving"
    | "completed"
    | "cancelled"
    | "reserved";
  total: number;
  customerName?: string;
  estimatedTime?: number;
  items: OrderItem[];
  createdAt: string;
}

// Ширээний интерфейс
interface Table {
  _id: string;
  number: number;
  capacity: number;
  status: "empty" | "reserved";
  location: "main-hall" | "terrace";
  qrCode?: string;
  currentOrder?: Order;
}

// Menu item интерфейс
interface MenuItem {
  _id: string;
  name: string;
  nameEn: string;
  nameMn?: string;
  nameJp?: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
}

// Table Layout Props
interface TableLayoutProps {
  tables: Table[];
  menuItems: MenuItem[];
  onStatusChange?: (tableId: string, status: "empty" | "reserved") => void;
  onViewQR?: (tableId: string) => void;
  onRefresh?: () => void;
  onCompleteOrder?: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  onPrintOrder?: (orderId: string) => void;
  onCreateOrder?: (orderData: {
    tableId: string;
    items: any[];
    total: number;
  }) => Promise<{ success: boolean }>;
}

export function TableLayout({
  tables,
  menuItems,
  onStatusChange,
  onViewQR,
  onRefresh,
  onCompleteOrder,
  onCancelOrder,
  onPrintOrder,
  onCreateOrder,
}: TableLayoutProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Статистик тооцоолох
  const stats = {
    totalTables: tables.length,
    emptyTables: tables.filter((t) => t.status === "empty").length,
    reservedTables: tables.filter((t) => t.status === "reserved").length,
    pendingOrders: tables.filter((t) => t.currentOrder?.status === "pending")
      .length,
    preparingOrders: tables.filter(
      (t) => t.currentOrder?.status === "preparing"
    ).length,
    totalRevenue: tables
      .filter((t) => t.currentOrder)
      .reduce((sum, t) => sum + (t.currentOrder?.total || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Гарчиг */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Захиалгын удирдлага
          </h1>
          <p className="mt-1 text-gray-600">
            Бүх ширээний мэдээлэл болон захиалгын статус
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Шинэчлэх
          </Button>
        </div>
      </div>

      {/* Статистик картууд */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="gap-2 p-2 h-18">
          <div className="flex items-center justify-between mb-0">
            <span className="text-sm font-medium text-gray-600">
              Нийт ширээ
            </span>
            <Users className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold leading-tight">
              {stats.totalTables}
            </div>
            <p className="text-xs leading-tight text-gray-500">
              {stats.emptyTables} хоосон, {stats.reservedTables} захиалгатай
            </p>
          </div>
        </Card>

        <Card className="gap-2 p-2 h-18 ">
          <div className="flex items-center justify-between mb-0">
            <span className="text-xs font-medium text-gray-600">
              Хүлээгдэж буй
            </span>
            <Clock className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold leading-tight text-yellow-600">
              {stats.pendingOrders}
            </div>
            <p className="text-xs leading-tight text-gray-500">
              Бэлтгэж буй: {stats.preparingOrders}
            </p>
          </div>
        </Card>

        <Card className="gap-2 p-2 h-18 ">
          <div className="flex items-center justify-between mb-0">
            <span className="text-xs font-medium text-gray-600">
              Нийт орлого
            </span>
            <DollarSign className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold leading-tight text-green-600">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs leading-tight text-gray-500">
              Өнөөдрийн захиалгууд
            </p>
          </div>
        </Card>

        <Card className="gap-2 p-2 h-18 ">
          <div className="flex items-center justify-between mb-0">
            <span className="text-xs font-medium text-gray-600">Хэрэглээ</span>
            <Grid className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold leading-tight">
              {Math.round((stats.reservedTables / stats.totalTables) * 100)}%
            </div>
            <p className="text-xs leading-tight text-gray-500">
              Ширээний ашиглалт
            </p>
          </div>
        </Card>
      </div>

      {/* Ширээний grid */}
      {viewMode === "grid" ? (
        <TablesGrid
          tables={tables}
          menuItems={menuItems}
          onStatusChange={onStatusChange}
          onViewQR={onViewQR}
          onCompleteOrder={onCompleteOrder}
          onCancelOrder={onCancelOrder}
          onPrintOrder={onPrintOrder}
          onCreateOrder={onCreateOrder}
          onRefresh={onRefresh}
        />
      ) : (
        <div className="space-y-4">
          {tables.map((table) => (
            <Card key={table._id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold">
                    Ширээ {table.number}
                  </div>
                  <Badge
                    className={
                      table.status === "empty"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {table.status === "empty" ? "Хоосон" : "Захиалгатай"}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {table.location === "main-hall"
                      ? "Үндсэн танхим"
                      : "Террас"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewQR?.(table._id)}
                  >
                    QR код
                  </Button>
                  {onStatusChange && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onStatusChange(
                          table._id,
                          table.status === "empty" ? "reserved" : "empty"
                        )
                      }
                    >
                      {table.status === "empty"
                        ? "Захиалгатай болгох"
                        : "Хоосон болгох"}
                    </Button>
                  )}
                </div>
              </div>
              {table.currentOrder && (
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm">
                    <span>Захиалга #{table.currentOrder.orderNumber}</span>
                    <Badge className="text-xs">
                      {table.currentOrder.status === "pending"
                        ? "Хүлээгдэж буй"
                        : table.currentOrder.status === "preparing"
                        ? "Бэлтгэж буй"
                        : table.currentOrder.status === "serving"
                        ? "Хооллож буй"
                        : table.currentOrder.status === "completed"
                        ? "Дууссан"
                        : table.currentOrder.status === "cancelled"
                        ? "Цуцлагдсан"
                        : "Захиалгатай"}
                    </Badge>
                    <span>
                      Нийт: ¥{table.currentOrder.total.toLocaleString()}
                    </span>
                    {table.currentOrder.customerName && (
                      <span>Хэрэглэгч: {table.currentOrder.customerName}</span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

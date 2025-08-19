"use client";

import { Card } from "@/components/ui/card";
import { Clock, DollarSign, Grid, Users } from "lucide-react";
import { TableStats } from "../types/table-layout.type";

interface TableStatsCardsProps {
  stats: TableStats;
}

export function TableStatsCards({ stats }: TableStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="gap-2 p-2 h-18">
        <div className="flex items-center justify-between mb-0">
          <span className="text-sm font-medium text-gray-600">Нийт ширээ</span>
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
          <span className="text-xs font-medium text-gray-600">Захиалга</span>
          <Clock className="w-3 h-3 text-gray-400" />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold leading-tight text-blue-600">
            {stats.orderTables}
          </div>
          <p className="text-xs leading-tight text-gray-500">
            {stats.bothOrderAndReservation} давхар, {stats.pendingOrders}{" "}
            хүлээгдэж
          </p>
        </div>
      </Card>

      <Card className="gap-2 p-2 h-18 ">
        <div className="flex items-center justify-between mb-0">
          <span className="text-xs font-medium text-gray-600">Нийт орлого</span>
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
            {Math.round(
              ((stats.orderTables + stats.reservedTables) / stats.totalTables) *
                100
            )}
            %
          </div>
          <p className="text-xs leading-tight text-gray-500">
            Ширээний ашиглалт
          </p>
        </div>
      </Card>
    </div>
  );
}

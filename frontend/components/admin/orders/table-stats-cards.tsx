"use client";

import { Card } from "@/components/ui/card";
import { Clock, DollarSign, Grid, Users } from "lucide-react";
import { TableStats } from "../types/table-layout.type";
import { formatPrice } from "../utils";

interface TableStatsCardsProps {
  stats: TableStats;
}

export function TableStatsCards({ stats }: TableStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="gap-2 p-2 h-18">
        <div className="flex items-center justify-between mb-0">
          <span className="text-base font-medium text-gray-600">
            Нийт ширээ
          </span>
          <Users className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold leading-tight">
            {stats.totalTables}
          </div>
          <p className="text-sm leading-tight text-gray-500">
            <span className="text-base font-bold">{stats.emptyTables}</span>{" "}
            хоосон,{" "}
            <span className="text-base font-bold">
              {stats.orderTables + stats.reservedTables}
            </span>{" "}
            захиалгатай
          </p>
        </div>
      </Card>

      <Card className="gap-2 p-2 h-18 ">
        <div className="flex items-center justify-between mb-0">
          <span className="text-base font-medium text-gray-600">Захиалга</span>
          <Clock className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold leading-tight text-blue-600">
            {stats.orderTables}
          </div>
          <p className="text-sm leading-tight text-gray-500">
            <span className="text-base font-bold">
              {stats.bothOrderAndReservation}
            </span>{" "}
            давхар захиалгатай,{" "}
            <span className="text-base font-bold">{stats.pendingOrders}</span>{" "}
            хүлээгдэж буй
          </p>
        </div>
      </Card>

      <Card className="gap-2 p-2 h-18 ">
        <div className="flex items-center justify-between mb-0">
          <span className="text-base font-medium text-gray-600">
            Нийт орлого
          </span>
          <DollarSign className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold leading-tight text-green-600">
            {formatPrice(stats.totalRevenue)}
          </div>
          <p className="text-sm leading-tight text-gray-500">
            Өнөөдрийн дууссан захиалгууд
          </p>
        </div>
      </Card>

      <Card className="gap-2 p-2 h-18 ">
        <div className="flex items-center justify-between mb-0">
          <span className="text-base font-medium text-gray-600">
            Ширээ ашиглалт
          </span>
          <Grid className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold leading-tight">
            {Math.round(
              ((stats.orderTables +
                stats.reservedTables -
                stats.bothOrderAndReservation) /
                stats.totalTables) *
                100
            )}
            %
          </div>
          <p className="text-sm leading-tight text-gray-500">
            Одоогийн байдлаар
          </p>
        </div>
      </Card>
    </div>
  );
}

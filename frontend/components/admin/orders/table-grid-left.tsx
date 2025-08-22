"use client";

import { TableCard } from "./table-card";
import { Trees } from "lucide-react";
import { TablesGridProps } from "../types/tables-grid.type";
import { getTableByNumber } from "./tables-grid-utils";

interface TableGridLeftProps extends TablesGridProps {}

export function TableGridLeft({
  tables,
  menuItems,
  onStatusChange,
  onViewQR,
  onCompleteOrder,
  onCancelOrder,
  onPrintOrder,
  onCreateOrder,
  onRefresh,
  onEditReservation,
}: TableGridLeftProps) {
  return (
    <div
      className="grid grid-cols-3 gap-12 auto-rows-auto"
      style={{ gridTemplateColumns: "repeat(3, minmax(260px, 300px))" }}
    >
      {/* Мөр 1: Ширээ 1, 2, 3 */}
      {getTableByNumber(tables, 1) && (
        <TableCard
          key={getTableByNumber(tables, 1)!._id}
          table={getTableByNumber(tables, 1)!}
          tables={tables}
          menuItems={menuItems}
          onStatusChange={onStatusChange}
          onViewQR={onViewQR}
          onCompleteOrder={onCompleteOrder}
          onCancelOrder={onCancelOrder}
          onPrintOrder={onPrintOrder}
          onCreateOrder={onCreateOrder}
          onRefresh={onRefresh}
          onEditReservation={onEditReservation}
        />
      )}
      {getTableByNumber(tables, 2) && (
        <TableCard
          key={getTableByNumber(tables, 2)!._id}
          table={getTableByNumber(tables, 2)!}
          tables={tables}
          menuItems={menuItems}
          onStatusChange={onStatusChange}
          onViewQR={onViewQR}
          onCompleteOrder={onCompleteOrder}
          onCancelOrder={onCancelOrder}
          onPrintOrder={onPrintOrder}
          onCreateOrder={onCreateOrder}
          onRefresh={onRefresh}
          onEditReservation={onEditReservation}
        />
      )}
      {getTableByNumber(tables, 3) && (
        <TableCard
          key={getTableByNumber(tables, 3)!._id}
          table={getTableByNumber(tables, 3)!}
          tables={tables}
          menuItems={menuItems}
          onStatusChange={onStatusChange}
          onViewQR={onViewQR}
          onCompleteOrder={onCompleteOrder}
          onCancelOrder={onCancelOrder}
          onPrintOrder={onPrintOrder}
          onCreateOrder={onCreateOrder}
          onRefresh={onRefresh}
          onEditReservation={onEditReservation}
        />
      )}

      {/* Мөр 2: Ширээ 4, 5, 6 */}
      {getTableByNumber(tables, 4) && (
        <TableCard
          key={getTableByNumber(tables, 4)!._id}
          table={getTableByNumber(tables, 4)!}
          tables={tables}
          menuItems={menuItems}
          onStatusChange={onStatusChange}
          onViewQR={onViewQR}
          onCompleteOrder={onCompleteOrder}
          onCancelOrder={onCancelOrder}
          onPrintOrder={onPrintOrder}
          onCreateOrder={onCreateOrder}
          onRefresh={onRefresh}
          onEditReservation={onEditReservation}
        />
      )}
      {getTableByNumber(tables, 5) && (
        <TableCard
          key={getTableByNumber(tables, 5)!._id}
          table={getTableByNumber(tables, 5)!}
          tables={tables}
          menuItems={menuItems}
          onStatusChange={onStatusChange}
          onViewQR={onViewQR}
          onCompleteOrder={onCompleteOrder}
          onCancelOrder={onCancelOrder}
          onPrintOrder={onPrintOrder}
          onCreateOrder={onCreateOrder}
          onRefresh={onRefresh}
          onEditReservation={onEditReservation}
        />
      )}
      {getTableByNumber(tables, 6) && (
        <TableCard
          key={getTableByNumber(tables, 6)!._id}
          table={getTableByNumber(tables, 6)!}
          tables={tables}
          menuItems={menuItems}
          onStatusChange={onStatusChange}
          onViewQR={onViewQR}
          onCompleteOrder={onCompleteOrder}
          onCancelOrder={onCancelOrder}
          onPrintOrder={onPrintOrder}
          onCreateOrder={onCreateOrder}
          onRefresh={onRefresh}
          onEditReservation={onEditReservation}
        />
      )}

      {/* Мөр 3: хоосон, хоосон, хоосон */}
      <div></div>
      <div></div>
      <div></div>

      {/* Мөр 4: "Террас", хоосон, хоосон */}
      <div className="flex items-center justify-center text-lg font-semibold text-gray-600 bg-gray-100 rounded-lg">
        <Trees className="w-5 h-5 mr-2" />
        <span>Террас</span>
        <span className="ml-2 text-sm text-gray-500">(5 ширээ)</span>
      </div>
      <div></div>
      <div></div>

      {/* Мөр 5: Ширээ 17, хоосон, хоосон */}
      {getTableByNumber(tables, 17) && (
        <TableCard
          key={getTableByNumber(tables, 17)!._id}
          table={getTableByNumber(tables, 17)!}
          tables={tables}
          menuItems={menuItems}
          onStatusChange={onStatusChange}
          onViewQR={onViewQR}
          onCompleteOrder={onCompleteOrder}
          onCancelOrder={onCancelOrder}
          onPrintOrder={onPrintOrder}
          onCreateOrder={onCreateOrder}
          onRefresh={onRefresh}
          onEditReservation={onEditReservation}
        />
      )}
      <div></div>
      <div></div>

      {/* Мөр 6: Ширээ 19, Ширээ 18, хоосон */}
      {getTableByNumber(tables, 19) && (
        <TableCard
          key={getTableByNumber(tables, 19)!._id}
          table={getTableByNumber(tables, 19)!}
          tables={tables}
          menuItems={menuItems}
          onStatusChange={onStatusChange}
          onViewQR={onViewQR}
          onCompleteOrder={onCompleteOrder}
          onCancelOrder={onCancelOrder}
          onPrintOrder={onPrintOrder}
          onCreateOrder={onCreateOrder}
          onRefresh={onRefresh}
          onEditReservation={onEditReservation}
        />
      )}
      {getTableByNumber(tables, 18) && (
        <TableCard
          key={getTableByNumber(tables, 18)!._id}
          table={getTableByNumber(tables, 18)!}
          tables={tables}
          menuItems={menuItems}
          onStatusChange={onStatusChange}
          onViewQR={onViewQR}
          onCompleteOrder={onCompleteOrder}
          onCancelOrder={onCancelOrder}
          onPrintOrder={onPrintOrder}
          onCreateOrder={onCreateOrder}
          onRefresh={onRefresh}
          onEditReservation={onEditReservation}
        />
      )}
      <div></div>

      {/* Мөр 7: Ширээ 20, Ширээ 21, хоосон */}
      {getTableByNumber(tables, 20) && (
        <TableCard
          key={getTableByNumber(tables, 20)!._id}
          table={getTableByNumber(tables, 20)!}
          tables={tables}
          menuItems={menuItems}
          onStatusChange={onStatusChange}
          onViewQR={onViewQR}
          onCompleteOrder={onCompleteOrder}
          onCancelOrder={onCancelOrder}
          onPrintOrder={onPrintOrder}
          onCreateOrder={onCreateOrder}
          onRefresh={onRefresh}
          onEditReservation={onEditReservation}
        />
      )}
      {getTableByNumber(tables, 21) && (
        <TableCard
          key={getTableByNumber(tables, 21)!._id}
          table={getTableByNumber(tables, 21)!}
          tables={tables}
          menuItems={menuItems}
          onStatusChange={onStatusChange}
          onViewQR={onViewQR}
          onCompleteOrder={onCompleteOrder}
          onCancelOrder={onCancelOrder}
          onPrintOrder={onPrintOrder}
          onCreateOrder={onCreateOrder}
          onRefresh={onRefresh}
          onEditReservation={onEditReservation}
        />
      )}
      <div></div>
    </div>
  );
}

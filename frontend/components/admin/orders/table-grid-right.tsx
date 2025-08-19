"use client";

import { TableCard } from "./table-card";
import { TablesGridProps } from "../types/tables-grid.type";
import { getTableByNumber } from "./tables-grid-utils";

interface TableGridRightProps extends TablesGridProps {}

export function TableGridRight({
  tables,
  menuItems,
  onStatusChange,
  onViewQR,
  onCompleteOrder,
  onCancelOrder,
  onPrintOrder,
  onCreateOrder,
  onRefresh,
}: TableGridRightProps) {
  return (
    <div
      className="grid grid-cols-2 gap-12 auto-rows-auto"
      style={{ gridTemplateColumns: "repeat(2, minmax(260px, 300px))" }}
    >
      {/* Мөр 1: Ширээ 7, Ширээ 8 */}
      {getTableByNumber(tables, 7) && (
        <TableCard
          key={getTableByNumber(tables, 7)!._id}
          table={getTableByNumber(tables, 7)!}
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
      )}
      {getTableByNumber(tables, 8) && (
        <TableCard
          key={getTableByNumber(tables, 8)!._id}
          table={getTableByNumber(tables, 8)!}
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
      )}

      {/* Мөр 2: хоосон, Ширээ 9 */}
      <div></div>
      {getTableByNumber(tables, 9) && (
        <TableCard
          key={getTableByNumber(tables, 9)!._id}
          table={getTableByNumber(tables, 9)!}
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
      )}

      {/* Мөр 3: хоосон, Ширээ 10 */}
      <div></div>
      {getTableByNumber(tables, 10) && (
        <TableCard
          key={getTableByNumber(tables, 10)!._id}
          table={getTableByNumber(tables, 10)!}
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
      )}

      {/* Мөр 4: хоосон, Ширээ 11 */}
      <div></div>
      {getTableByNumber(tables, 11) && (
        <TableCard
          key={getTableByNumber(tables, 11)!._id}
          table={getTableByNumber(tables, 11)!}
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
      )}

      {/* Мөр 5: Ширээ 15, Ширээ 12 */}
      {getTableByNumber(tables, 15) && (
        <TableCard
          key={getTableByNumber(tables, 15)!._id}
          table={getTableByNumber(tables, 15)!}
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
      )}
      {getTableByNumber(tables, 12) && (
        <TableCard
          key={getTableByNumber(tables, 12)!._id}
          table={getTableByNumber(tables, 12)!}
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
      )}

      {/* Мөр 6: хоосон, Ширээ 13 */}
      <div></div>
      {getTableByNumber(tables, 13) && (
        <TableCard
          key={getTableByNumber(tables, 13)!._id}
          table={getTableByNumber(tables, 13)!}
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
      )}

      {/* Мөр 7: Ширээ 16, Ширээ 14 */}
      {getTableByNumber(tables, 16) && (
        <TableCard
          key={getTableByNumber(tables, 16)!._id}
          table={getTableByNumber(tables, 16)!}
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
      )}
      {getTableByNumber(tables, 14) && (
        <TableCard
          key={getTableByNumber(tables, 14)!._id}
          table={getTableByNumber(tables, 14)!}
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
      )}
    </div>
  );
}

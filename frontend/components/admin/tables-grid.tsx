"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit } from 'lucide-react'

interface Table {
  _id: string
  number: number
  capacity: number
  status: string
  currentOrder?: { orderNumber: string; status: string; total: number }
}

interface TablesGridProps {
  tables: Table[]
}

export function TablesGrid({ tables }: TablesGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-red-100 text-red-800 border-red-200"
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "reserved":
        return "bg-red-100 text-red-800 border-red-200" // Red for reserved as requested
      case "cleaning":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "maintenance":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {tables.map((table) => (
        <Card key={table._id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Table {table.number}</CardTitle>
              <Badge className={getStatusColor(table.status)}>{table.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Capacity:</span>
                <span>{table.capacity} guests</span>
              </div>
              {table.currentOrder && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Order:</span>
                    <span className="text-xs sm:text-sm">{table.currentOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total:</span>
                    <span>${table.currentOrder.total.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
              {table.status === "occupied" && (
                <Button size="sm" variant="outline" className="flex-1">
                  Clear Table
                </Button>
              )}
              {table.status === "cleaning" && (
                <Button size="sm" className="flex-1">
                  Mark Available
                </Button>
              )}
              <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TableSelectorProps {
  onTableSelect: (tableNumber: number) => void
  restaurantName: string
}

export default function TableSelector({ onTableSelect, restaurantName }: TableSelectorProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null)

  const tables = Array.from({ length: 20 }, (_, i) => i + 1)

  const handleTableSelect = (tableNumber: number) => {
    setSelectedTable(tableNumber)
    onTableSelect(tableNumber)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-600">
            {restaurantName}
          </CardTitle>
          <p className="text-gray-600">Please select your table number</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {tables.map((tableNum) => (
              <Button
                key={tableNum}
                variant={selectedTable === tableNum ? "default" : "outline"}
                className={`aspect-square ${
                  selectedTable === tableNum 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "hover:bg-red-50"
                }`}
                onClick={() => handleTableSelect(tableNum)}
              >
                {tableNum}
              </Button>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Can't find your table? Please ask our staff for assistance.
            </p>
            <Button 
              variant="outline" 
              onClick={() => onTableSelect(0)}
              className="w-full"
            >
              Continue without table number
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

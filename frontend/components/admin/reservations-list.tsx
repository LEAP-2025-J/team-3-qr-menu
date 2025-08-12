"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit } from 'lucide-react'

interface Reservation {
  _id: string
  reservationNumber: string
  customerName: string
  customerPhone: string
  date: string
  time: string
  partySize: number
  status: string
  table?: { number: number }
}

interface ReservationsListProps {
  reservations: Reservation[]
}

export function ReservationsList({ reservations }: ReservationsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Reservations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div key={reservation._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium">{reservation.customerName}</p>
                  <p className="text-sm text-gray-500">{reservation.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{reservation.time}</p>
                  <p className="text-xs text-gray-500">{reservation.partySize} guests</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className={getStatusColor(reservation.status)}>
                  {reservation.status}
                </Badge>
                {reservation.table && (
                  <Badge variant="outline">Table {reservation.table.number}</Badge>
                )}
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    Cancel
                  </Button>
                  {reservation.status === "pending" && (
                    <Button size="sm">Confirm</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

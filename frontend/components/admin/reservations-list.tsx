"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Phone, Users, Clock, CheckCircle, Edit, XCircle, Trash2 } from "lucide-react"
import { format, parseISO, addMinutes, isAfter } from "date-fns"

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
  onStatusChange: (id: string, status: string) => Promise<void>
  onCancel: (id: string) => Promise<void>
  onEdit: (reservation: Reservation) => void
  onDelete: (id: string) => Promise<void>
}

export function ReservationsList({ reservations, onStatusChange, onCancel, onEdit, onDelete }: ReservationsListProps) {
  const [filterDate, setFilterDate] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter reservations based on selected filters
  const filteredReservations = useMemo(() => {
    let filtered = reservations;

    if (filterDate !== "all") {
      const selectedDate = new Date(filterDate);
      filtered = filtered.filter(reservation => {
        const reservationDate = new Date(reservation.date);
        return reservationDate.toDateString() === selectedDate.toDateString();
      });
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(reservation => reservation.status === filterStatus);
    }

    return filtered;
  }, [reservations, filterDate, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200"
      case "seated": return "bg-green-100 text-green-800 border-green-200"
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled": return "bg-red-100 text-red-800 border-red-200"
      case "no-show": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const isReservationExpired = (reservation: any) => {
    const reservationTime = new Date(`${reservation.date}T${reservation.time}`);
    const now = new Date();
    const diffInMinutes = (now.getTime() - reservationTime.getTime()) / (1000 * 60);
    return diffInMinutes > 30 && reservation.status === "pending";
  }

  const getExpiryStatus = (reservation: any) => {
    const reservationTime = new Date(`${reservation.date}T${reservation.time}`);
    const now = new Date();
    const diffInMinutes = (now.getTime() - reservationTime.getTime()) / (1000 * 60);
    
    if (diffInMinutes > 30 && reservation.status === "pending") {
      return "expired";
    } else if (diffInMinutes > 20 && reservation.status === "pending") {
      return "warning";
    }
    return "ok";
  }

  const handlePeopleArrived = async (id: string) => {
    if (onStatusChange) {
      await onStatusChange(id, "seated");
    }
  }

  const handleCancel = async (id: string) => {
    if (onCancel) {
      await onCancel(id);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>All Reservations ({filteredReservations.length})</span>
          <div className="flex gap-2">
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-auto"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="seated">Seated</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No reservations found</p>
            </div>
          ) : (
            filteredReservations.map((reservation) => {
              const expiryStatus = getExpiryStatus(reservation)
              const isExpired = isReservationExpired(reservation)
              
              return (
                <div 
                  key={reservation._id} 
                  className={`p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                    expiryStatus === "expired" ? "border-red-300 bg-red-50" :
                    expiryStatus === "warning" ? "border-orange-300 bg-orange-50" :
                    "border-gray-200"
                  }`}
                >
                  {/* Mobile Layout */}
                  <div className="block sm:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-base">{reservation.customerName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Phone className="w-3 h-3" />
                          {reservation.customerPhone}
                        </div>
                      </div>
                      <Badge className={getStatusColor(reservation.status)}>
                        {reservation.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">{reservation.time}</p>
                        <p className="text-gray-500">{formatDate(reservation.date)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Users className="w-3 h-3" />
                          {reservation.partySize} guests
                        </div>
                        <p className="text-xs text-gray-400">#{reservation.reservationNumber}</p>
                      </div>
                    </div>
                    
                    {reservation.table && (
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Table {reservation.table.number}</Badge>
                        {expiryStatus === "warning" && (
                          <div className="flex items-center gap-1 text-orange-600 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>Expires soon</span>
                          </div>
                        )}
                        {expiryStatus === "expired" && (
                          <div className="flex items-center gap-1 text-red-600 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>Expired</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                      {reservation.status === "pending" && !isExpired && (
                        <Button 
                          size="sm" 
                          onClick={() => handlePeopleArrived(reservation._id)}
                          className="bg-green-600 hover:bg-green-700 w-full"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          People Arrived
                        </Button>
                      )}
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onEdit(reservation)} className="flex-1">
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        {reservation.status === "pending" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleCancel(reservation._id)}
                            className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        
                        {/* Delete button for seated and cancelled reservations */}
                        {(reservation.status === "seated" || reservation.status === "cancelled") && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onDelete(reservation._id)}
                            className="flex-1 text-red-700 border-red-400 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{reservation.customerName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="w-3 h-3" />
                          {reservation.customerPhone}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{reservation.time}</p>
                        <p className="text-sm text-gray-600">{formatDate(reservation.date)}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          {reservation.partySize} guests
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">#{reservation.reservationNumber}</p>
                        <p className="text-xs text-gray-400">{formatDate(reservation.date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(reservation.status)}>
                        {reservation.status}
                      </Badge>
                      
                      {reservation.table && (
                        <Badge variant="outline">Table {reservation.table.number}</Badge>
                      )}
                      
                      {/* Expiry Warning */}
                      {expiryStatus === "warning" && (
                        <div className="flex items-center gap-1 text-orange-600 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Expires soon</span>
                        </div>
                      )}
                      
                      {expiryStatus === "expired" && (
                        <div className="flex items-center gap-1 text-red-600 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Expired</span>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        {/* People Arrived Button - only for pending reservations */}
                        {reservation.status === "pending" && !isExpired && (
                          <Button 
                            size="sm" 
                            onClick={() => handlePeopleArrived(reservation._id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            People Arrived
                          </Button>
                        )}
                        
                        {/* Edit Button */}
                        <Button size="sm" variant="outline" onClick={() => onEdit(reservation)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        {/* Cancel Button */}
                        {reservation.status === "pending" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleCancel(reservation._id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        
                        {/* Delete Button for seated and cancelled reservations */}
                        {(reservation.status === "seated" || reservation.status === "cancelled") && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onDelete(reservation._id)}
                            className="text-red-700 border-red-400 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

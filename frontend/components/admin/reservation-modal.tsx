"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, Users, Phone, User } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Table {
  _id: string
  number: number
  capacity: number
  status: string
}

interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reservationData: any) => Promise<{ success: boolean; message?: string; error?: string }>
  tables: Table[]
}

export function ReservationModal({ isOpen, onClose, onSubmit, tables }: ReservationModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    date: new Date(),
    time: "",
    partySize: 1,
    tableId: "",
    specialRequests: ""
  })
  const [loading, setLoading] = useState(false)
  const [availableTimes] = useState([
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customerName || !formData.customerPhone || !formData.date || !formData.time || !formData.tableId) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const result = await onSubmit({
        ...formData,
        date: formData.date.toISOString().split('T')[0],
        time: formData.time
      })
      
      if (result.success) {
        alert(result.message || "Reservation created successfully!")
        onClose()
        setFormData({
          customerName: "",
          customerPhone: "",
          date: new Date(),
          time: "",
          partySize: 1,
          tableId: "",
          specialRequests: ""
        })
      } else {
        alert(result.error || "Failed to create reservation")
      }
    } catch (error) {
      alert("Error creating reservation")
    } finally {
      setLoading(false)
    }
  }

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "available": return "text-green-600"
      case "occupied": return "text-red-600"
      case "reserved": return "text-orange-600"
      case "cleaning": return "text-blue-600"
      case "maintenance": return "text-gray-600"
      default: return "text-gray-600"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-center text-lg sm:text-xl">New Reservation</DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            Create a new reservation for your restaurant
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">
                <User className="w-4 h-4 inline mr-2" />
                Customer Name *
              </Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Enter customer name"
                required
                className="text-base sm:text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerPhone">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number *
              </Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="Enter phone number"
                required
                className="text-base sm:text-sm"
                type="tel"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal text-base sm:text-sm",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData({ ...formData, date })}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                <Clock className="w-4 h-4 inline mr-2" />
                Time *
              </Label>
              <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                <SelectTrigger className="text-base sm:text-sm">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Party Size and Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partySize">
                <Users className="w-4 h-4 inline mr-2" />
                Party Size *
              </Label>
              <Input
                id="partySize"
                type="number"
                min="1"
                max="20"
                value={formData.partySize}
                onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) || 1 })}
                required
                className="text-base sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tableId">Table *</Label>
              <Select value={formData.tableId} onValueChange={(value) => setFormData({ ...formData, tableId: value })}>
                <SelectTrigger className="text-base sm:text-sm">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table._id} value={table._id}>
                      <div className="flex items-center justify-between w-full">
                        <span>Table {table.number}</span>
                        <span className={cn("text-xs", getTableStatusColor(table.status))}>
                          ({table.status})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Input
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder="Any special requests or notes"
              className="text-base sm:text-sm"
            />
          </div>

          {/* Table Status Summary */}
          <Card className="text-xs sm:text-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">Table Status Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-1">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  <span>Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span>Cleaning</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                  <span>Maintenance</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Creating..." : "Create Reservation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
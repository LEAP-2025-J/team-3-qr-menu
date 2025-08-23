"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Users, Phone, User } from "lucide-react";
import { formatNumberForInput } from "../utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Table {
  _id: string;
  number: number;
  capacity: number;
  status: string;
}

interface Reservation {
  _id: string;
  reservationNumber: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
  status: string;
  table?: { number: number; _id: string };
  specialRequests?: string;
  createdAt: string;
  updatedAt?: string;
}

interface EditReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    data: any
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  reservation: Reservation | null;
  tables: Table[];
}

export function EditReservationModal({
  isOpen,
  onClose,
  onSave,
  reservation,
  tables,
}: EditReservationModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    date: new Date(),
    time: "",
    partySize: 1,
    tableId: "",
    specialRequests: "",
  });
  const [loading, setLoading] = useState(false);
  const [availableTimes] = useState([
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
  ]);

  // Update form data when reservation changes
  useEffect(() => {
    if (reservation) {
      setFormData({
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        date: new Date(reservation.date),
        time: reservation.time,
        partySize: reservation.partySize,
        tableId: reservation.table?._id || "",
        specialRequests: reservation.specialRequests || "",
      });
    }
  }, [reservation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !reservation ||
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.date ||
      !formData.time ||
      !formData.tableId
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await onSave(reservation._id, {
        ...formData,
        date: formData.date.toISOString().split("T")[0],
        time: formData.time,
      });

      if (result.success) {
        alert(result.message || "Reservation updated successfully!");
        onClose();
      } else {
        alert(result.error || "Failed to update reservation");
      }
    } catch (error) {
      alert("Error updating reservation");
    } finally {
      setLoading(false);
    }
  };

  // Захиалга цуцлах функц
  const handleCancelReservation = async () => {
    if (loading || !reservation) return;

    const confirmCancel = window.confirm(
      `${reservation.reservationNumber} захиалгыг цуцлах уу?`
    );

    if (!confirmCancel) return;

    setLoading(true);
    try {
      const API_CONFIG = (await import("@/config/api")).API_CONFIG;
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/reservations/${reservation._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "cancelled" }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Захиалга амжилттай цуцлагдлаа!");
        onClose();
      } else {
        alert(result.error || "Захиалга цуцлахад алдаа гарлаа");
      }
    } catch (error) {
      alert("Захиалга цуцлахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-600";
      case "occupied":
        return "text-red-600";
      case "reserved":
        return "text-orange-600";
      case "cleaning":
        return "text-blue-600";
      case "maintenance":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] mx-4 flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg text-center sm:text-xl">
            Edit Reservation
          </DialogTitle>
          <DialogDescription className="text-sm text-center sm:text-base">
            Update reservation details for {reservation.reservationNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-2">
            {/* Customer Information */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  <User className="inline w-4 h-4 mr-2" />
                  Customer Name *
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="Enter customer name"
                  required
                  className="text-base sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Phone Number *
                </Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  required
                  className="text-base sm:text-sm"
                  type="tel"
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formData.date
                        ? format(formData.date, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Time *
                </Label>
                <Select
                  value={formData.time}
                  onValueChange={(value) =>
                    setFormData({ ...formData, time: value })
                  }
                >
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="partySize">
                  <Users className="inline w-4 h-4 mr-2" />
                  Party Size *
                </Label>
                <Input
                  id="partySize"
                  type="number"
                  min="1"
                  max="20"
                  value={formatNumberForInput(formData.partySize, 1)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      partySize: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                  className="text-base sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tableId">Table *</Label>
                <Select
                  value={formData.tableId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tableId: value })
                  }
                >
                  <SelectTrigger className="text-base sm:text-sm">
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table._id} value={table._id}>
                        <div className="flex items-center justify-between w-full">
                          <span>Table {table.number}</span>
                          <span
                            className={cn(
                              "text-xs",
                              getTableStatusColor(table.status)
                            )}
                          >
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
                onChange={(e) =>
                  setFormData({ ...formData, specialRequests: e.target.value })
                }
                placeholder="Any special requests or notes"
                className="text-base sm:text-sm"
              />
            </div>

            {/* Current Reservation Info */}
            <Card className="text-xs sm:text-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base">
                  Current Reservation Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Reservation #</p>
                    <p className="text-gray-600">
                      {reservation.reservationNumber}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Current Status</p>
                    <Badge className="mt-1">{reservation.status}</Badge>
                  </div>
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-gray-600">
                      {new Date(reservation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-gray-600">
                      {new Date(
                        reservation.updatedAt || reservation.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex gap-2 mt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelReservation}
              disabled={loading || reservation.status === "cancelled"}
              className="flex-1 sm:w-auto"
            >
              {loading ? "Цуцлаж байна..." : "Захиалга цуцлах"}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:w-auto"
            >
              {loading ? "Updating..." : "Update Reservation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

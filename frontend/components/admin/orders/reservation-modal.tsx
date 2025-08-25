"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    reservationData: any
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  tables: Table[];
  existingReservations?: any[]; // Add this to check for conflicts
  editingReservation?: any; // For editing existing reservation
  selectedTableId?: string; // For pre-selecting table
  onRefresh?: () => void; // For refreshing data after cancellation
}

export function ReservationModal({
  isOpen,
  onClose,
  onSubmit,
  tables,
  existingReservations = [],
  editingReservation,
  selectedTableId,
  onRefresh,
}: ReservationModalProps) {
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
  const [validationError, setValidationError] = useState("");
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

  // Load editing reservation data when modal opens
  useEffect(() => {
    if (editingReservation) {
      setFormData({
        customerName: editingReservation.customerName || "",
        customerPhone: editingReservation.customerPhone || "",
        date: new Date(editingReservation.date) || new Date(),
        time: editingReservation.time || "",
        partySize: editingReservation.partySize || 1,
        tableId:
          editingReservation.table?._id || editingReservation.table || "",
        specialRequests: editingReservation.specialRequests || "",
      });
    } else {
      // Reset form for new reservation
      setFormData({
        customerName: "",
        customerPhone: "",
        date: new Date(),
        time: "",
        partySize: 1,
        tableId: selectedTableId || "",
        specialRequests: "",
      });
    }
  }, [editingReservation, selectedTableId, isOpen]);

  // Function to check for table conflicts
  const checkTableConflict = (tableId: string, date: Date, time: string) => {
    if (!tableId || !date || !time) return null;

    const selectedDate = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    const requestedTimeMinutes = hours * 60 + minutes;

    // Check existing reservations for conflicts
    const conflictingReservation = existingReservations.find((res) => {
      if (res.table && res.table._id === tableId) {
        const resDate = new Date(res.date);
        if (resDate.toDateString() === selectedDate.toDateString()) {
          const [resHours, resMinutes] = res.time.split(":").map(Number);
          const resTimeMinutes = resHours * 60 + resMinutes;
          const timeDifference = Math.abs(
            requestedTimeMinutes - resTimeMinutes
          );

          // Check if reservations are less than 2 hours apart
          return (
            timeDifference < 120 &&
            res.status !== "cancelled" &&
            res.status !== "no-show" &&
            res.status !== "completed"
          );
        }
      }
      return false;
    });

    return conflictingReservation;
  };

  // Real-time conflict checking
  const currentConflict = checkTableConflict(
    formData.tableId,
    formData.date,
    formData.time
  );
  const isTimeSlotAvailable = !currentConflict;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.date ||
      !formData.time ||
      !formData.tableId
    ) {
      setValidationError("Please fill in all required fields");
      return;
    }

    // Check for table conflicts before submitting
    const conflict = checkTableConflict(
      formData.tableId,
      formData.date,
      formData.time
    );
    if (conflict) {
      setValidationError(
        `Table already has a reservation at ${conflict.time} on ${new Date(
          conflict.date
        ).toLocaleDateString()}. Reservations must be at least 2 hours apart.`
      );
      return;
    }

    setLoading(true);
    try {
      // Convert date to UTC+8 timezone (Mongolia timezone)
      const localDate = new Date(formData.date);
      const utcDate = new Date(
        localDate.getTime() + 8 * 60 * 60 * 1000 // Add 8 hours for UTC+8
      );
      const utcDateString = utcDate.toISOString().split("T")[0];

      const result = await onSubmit({
        ...formData,
        date: utcDateString,
        time: formData.time,
      });

      if (result.success) {
        alert(
          result.message ||
            (editingReservation
              ? "Reservation updated successfully!"
              : "Reservation created successfully!")
        );
        onClose();
        setFormData({
          customerName: "",
          customerPhone: "",
          date: new Date(),
          time: "",
          partySize: 1,
          tableId: "",
          specialRequests: "",
        });
      } else {
        setValidationError(
          result.error ||
            (editingReservation
              ? "Failed to update reservation"
              : "Failed to create reservation")
        );
      }
    } catch (error) {
      setValidationError(
        editingReservation
          ? "Error updating reservation"
          : "Error creating reservation"
      );
    } finally {
      setLoading(false);
    }
  };

  // Захиалга цуцлах функц
  const handleCancelReservation = async () => {
    if (loading || !editingReservation) return;

    const confirmCancel = window.confirm(
      `${editingReservation.reservationNumber || "Энэ"} захиалгыг цуцлах уу?`
    );

    if (!confirmCancel) return;

    setLoading(true);
    try {
      const API_CONFIG = (await import("@/config/api")).API_CONFIG;
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/reservations/${editingReservation._id}`,
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
        // Refresh data after cancellation
        if (onRefresh) {
          onRefresh();
        }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg text-center sm:text-xl">
            {editingReservation ? "Edit Reservation" : "New Reservation"}
          </DialogTitle>
          <DialogDescription className="text-sm text-center sm:text-base">
            {editingReservation
              ? "Edit existing reservation details"
              : "Create a new reservation for your restaurant"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                    disabled={(date) => date < new Date()}
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
                  {availableTimes.map((time) => {
                    const hasConflict =
                      formData.tableId && formData.date
                        ? checkTableConflict(
                            formData.tableId,
                            formData.date,
                            time
                          )
                        : false;

                    return (
                      <SelectItem
                        key={time}
                        value={time}
                        className={
                          hasConflict ? "text-red-500 line-through" : ""
                        }
                        disabled={hasConflict}
                      >
                        {time} {hasConflict && "(Unavailable)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {currentConflict && (
                <p className="text-xs text-orange-600">
                  ⚠️ This time conflicts with existing reservation at{" "}
                  {currentConflict.time}
                </p>
              )}
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

          {/* Validation Error Display */}
          {validationError &&
            !validationError.includes("Table currently has active orders") && (
              <div className="p-4 bg-white border-2 border-red-400 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg text-red-600">⚠️</span>
                  <p className="text-sm font-medium text-red-600">
                    {validationError}
                  </p>
                </div>
              </div>
            )}

          {/* Backend Error Display - More Prominent */}
          {validationError &&
            (validationError.includes("Failed to create reservation") ||
              validationError.includes(
                "Table currently has active orders"
              )) && (
              <div className="p-4 bg-white border-2 border-red-500 rounded-lg shadow-md">
                <div className="flex items-center gap-3">
                  <span className="text-xl text-red-700">🚫</span>
                  <div>
                    <p className="text-sm font-bold text-red-700">
                      Reservation Creation Failed
                    </p>
                    <p className="mt-1 text-sm text-red-600">
                      {validationError}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Availability Status */}
          {formData.tableId && formData.date && formData.time && (
            <div
              className={`border rounded-md p-3 ${
                isTimeSlotAvailable
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isTimeSlotAvailable ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <span
                  className={`text-sm font-medium ${
                    isTimeSlotAvailable ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {isTimeSlotAvailable
                    ? "Time slot available"
                    : "Time slot unavailable"}
                </span>
              </div>
              {currentConflict && (
                <div className="p-2 mt-2 bg-white border border-red-300 rounded-md">
                  <p className="text-xs font-medium text-red-600">
                    ⚠️ Conflicts with: {currentConflict.customerName} at{" "}
                    {currentConflict.time}
                    (Status: {currentConflict.status})
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
            <Button
              type="button"
              variant={editingReservation ? "destructive" : "outline"}
              onClick={editingReservation ? handleCancelReservation : onClose}
              className="w-full sm:w-auto"
            >
              {editingReservation ? "Захиалга цуцлах" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading
                ? editingReservation
                  ? "Updating..."
                  : "Creating..."
                : editingReservation
                ? "Update Reservation"
                : "Create Reservation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
  const [partySizeInput, setPartySizeInput] = useState("1"); // Separate state for input display

  // Цагийн формат шалгах функц
  const validateTimeFormat = (time: string, date: Date): string | null => {
    if (!time) return "Цаг заавал оруулна уу";

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return "Зөв цагийн формат оруулна уу (ЖН: 14:30)";
    }

    // Өнгөрсөн цаг оруулахыг хориглох
    const selectedDate = new Date(date);
    const today = new Date();

    // Хэрэв өнөөдөр бол цагийг шалгах
    if (selectedDate.toDateString() === today.toDateString()) {
      const [hours, minutes] = time.split(":").map(Number);
      const selectedTimeMinutes = hours * 60 + minutes;
      const currentTimeMinutes = today.getHours() * 60 + today.getMinutes();

      if (selectedTimeMinutes <= currentTimeMinutes) {
        return "Өнгөрсөн цаг сонгож болохгүй";
      }
    }

    return null;
  };

  // Load editing reservation data when modal opens
  useEffect(() => {
    if (editingReservation) {
      const partySize = editingReservation.partySize || 1;
      setFormData({
        customerName: editingReservation.customerName || "",
        customerPhone: editingReservation.customerPhone || "",
        date: new Date(editingReservation.date) || new Date(),
        time: editingReservation.time || "",
        partySize: partySize,
        tableId:
          editingReservation.table?._id || editingReservation.table || "",
        specialRequests: editingReservation.specialRequests || "",
      });
      setPartySizeInput(partySize.toString());
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
      setPartySizeInput("1");
    }
  }, [editingReservation, selectedTableId, isOpen]);

  // Function to check for table conflicts - өмнө болон хойно 2 цагийн дотор
  const checkTableConflict = (tableId: string, date: Date, time: string) => {
    if (!tableId || !date || !time) return null;

    // Цагийн формат шалгах
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) return null;

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

          // Шинэ логик: өмнө болон хойно 2 цагийн дотор давхцал шалгах
          const isWithinTwoHoursBefore =
            requestedTimeMinutes >= resTimeMinutes - 120 &&
            requestedTimeMinutes < resTimeMinutes;
          const isWithinTwoHoursAfter =
            requestedTimeMinutes > resTimeMinutes &&
            requestedTimeMinutes <= resTimeMinutes + 120;
          const isExactTime = requestedTimeMinutes === resTimeMinutes;

          return (
            (isWithinTwoHoursBefore || isWithinTwoHoursAfter || isExactTime) &&
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

  // Real-time цагийн validation
  const currentTimeError = formData.time
    ? validateTimeFormat(formData.time, formData.date)
    : null;

  const isTimeSlotAvailable = !currentConflict && !currentTimeError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Цагийн формат шалгах
    const timeError = validateTimeFormat(formData.time, formData.date);
    if (timeError) {
      setValidationError(timeError);
      return;
    }

    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.date ||
      !formData.time ||
      !formData.tableId
    ) {
      setValidationError("Бүх заавал талбаруудыг бөглөнө үү");
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
        `Энэ ширээнд ${conflict.time} цагт ${new Date(
          conflict.date
        ).toLocaleDateString()}-нд захиалга байна. Захиалгууд хамгийн багадаа 2 цагийн зайтай байх ёстой.`
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
              ? "Захиалга амжилттай шинэчлэгдлээ!"
              : "Захиалга амжилттай үүсгэгдлээ!")
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
        setPartySizeInput("1");
      } else {
        setValidationError(
          result.error ||
            (editingReservation
              ? "Захиалга шинэчлэх амжилтгүй"
              : "Захиалга үүсгэх амжилтгүй")
        );
      }
    } catch (error) {
      setValidationError(
        editingReservation
          ? "Захиалга шинэчлэхэд алдаа гарлаа"
          : "Захиалга үүсгэхэд алдаа гарлаа"
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
            {editingReservation ? "Захиалга засах" : "Шинэ захиалга"}
          </DialogTitle>
          <DialogDescription className="text-sm text-center sm:text-base">
            {editingReservation
              ? "Байгаа захиалгын мэдээллийг засах"
              : "Ресторанд шинэ захиалга үүсгэх"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">
                <User className="inline w-4 h-4 mr-2" />
                Хэрэглэгчийн нэр *
              </Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                placeholder="Хэрэглэгчийн нэрийг оруулна уу"
                required
                className="text-base sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">
                <Phone className="inline w-4 h-4 mr-2" />
                Утасны дугаар *
              </Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                placeholder="Утасны дугаарыг оруулна уу"
                required
                className="text-base sm:text-sm"
                type="tel"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Огноо *</Label>
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
                      : "Огноо сонгоно уу"}
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
                Цаг *
              </Label>
              <Input
                id="time"
                type="time"
                step="1800"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                required
                className="text-base sm:text-sm"
              />
              {currentTimeError && (
                <p className="text-xs text-red-600">⚠️ {currentTimeError}</p>
              )}
              {currentConflict && (
                <p className="text-xs text-orange-600">
                  ⚠️ Энэ цаг {currentConflict.time} цагтай давхцаж байна
                </p>
              )}
              <p className="text-xs text-gray-500">
                Жишээ: 14:30, 09:00, 21:15
              </p>
            </div>
          </div>

          {/* Party Size and Table */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="partySize">
                <Users className="inline w-4 h-4 mr-2" />
                Хүний тоо *
              </Label>
              <Input
                id="partySize"
                type="number"
                min="1"
                max="20"
                value={partySizeInput}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setPartySizeInput(inputValue);

                  // Хэрэв хоосон string бол парамтерыг 1 болгох, харин display хэвээр үлдээх
                  if (inputValue === "") {
                    setFormData({
                      ...formData,
                      partySize: 1,
                    });
                  } else {
                    const numValue = parseInt(inputValue);
                    if (!isNaN(numValue) && numValue >= 1) {
                      setFormData({
                        ...formData,
                        partySize: numValue,
                      });
                    }
                  }
                }}
                onBlur={(e) => {
                  // Focus алдах үед хэрэв хоосон бол 1 болгож харуулах
                  if (partySizeInput === "" || parseInt(partySizeInput) <= 0) {
                    setPartySizeInput("1");
                    setFormData({
                      ...formData,
                      partySize: 1,
                    });
                  }
                }}
                required
                className="text-base sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tableId">Ширээ *</Label>
              <Select
                value={formData.tableId}
                onValueChange={(value) =>
                  setFormData({ ...formData, tableId: value })
                }
              >
                <SelectTrigger className="text-base sm:text-sm">
                  <SelectValue placeholder="Ширээ сонгоно уу" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table._id} value={table._id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{table.number}-р ширээ</span>
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
            <Label htmlFor="specialRequests">Тусгай хүсэлт</Label>
            <Input
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) =>
                setFormData({ ...formData, specialRequests: e.target.value })
              }
              placeholder="Тусгай хүсэлт эсвэл тэмдэглэл"
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
                      Захиалга үүсгэх амжилтгүй
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
                  {isTimeSlotAvailable ? "Цаг боломжтой" : "Цаг боломжгүй"}
                </span>
              </div>
              {currentTimeError && (
                <div className="p-2 mt-2 bg-white border border-red-300 rounded-md">
                  <p className="text-xs font-medium text-red-600">
                    ⚠️ Цагийн алдаа: {currentTimeError}
                  </p>
                </div>
              )}
              {currentConflict && (
                <div className="p-2 mt-2 bg-white border border-red-300 rounded-md">
                  <p className="text-xs font-medium text-red-600">
                    ⚠️ Давхцал: {currentConflict.customerName}-ын{" "}
                    {currentConflict.time} цагийн захиалгатай (Статус:{" "}
                    {currentConflict.status})
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
              {editingReservation ? "Захиалга цуцлах" : "Хаах"}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading
                ? editingReservation
                  ? "Шинэчилж байна..."
                  : "Үүсгэж байна..."
                : editingReservation
                ? "Захиалга шинэчлэх"
                : "Захиалга үүсгэх"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

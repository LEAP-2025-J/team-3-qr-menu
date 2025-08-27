"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";

export default function BusinessDaySettings() {
  const [isBusinessDayMode, setIsBusinessDayMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Local storage-ээс business day mode-г авах
  useEffect(() => {
    const savedMode = localStorage.getItem("businessDayMode");
    if (savedMode) {
      setIsBusinessDayMode(savedMode === "true");
    }
  }, []);

  // Business day mode-г өөрчлөх
  const handleBusinessDayToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      // Local storage-д хадгалах
      localStorage.setItem("businessDayMode", checked.toString());
      setIsBusinessDayMode(checked);

      // Notification context-д мэдэгдэх (хэрэв байвал)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("businessDayModeChanged", {
            detail: { isBusinessDayMode: checked },
          })
        );
      }

      // API-г тест хийх
      const testResponse = await fetch(
        `/api/orders/notifications?useBusinessDay=${checked}`
      );
      if (testResponse.ok) {
        console.log(`✅ Business day mode ${checked ? "ON" : "OFF"} болсон`);
      }
    } catch (error) {
      console.error("❌ Business day mode өөрчлөхөд алдаа:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Одоогийн business day мэдээлэл
  const getCurrentBusinessDayInfo = () => {
    const now = new Date();
    const utc8Time = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" })
    );
    const currentHour = utc8Time.getHours();

    if (currentHour >= 0 && currentHour < 9) {
      // 04:00-09:00 хооронд - өмнөх өдөр
      const previousDay = new Date(utc8Time);
      previousDay.setDate(previousDay.getDate() - 1);
      return {
        businessDay: previousDay.toISOString().split("T")[0],
        status: "Өмнөх өдөр (04:00-09:00)",
        color: "bg-blue-100 text-blue-800",
      };
    } else {
      // 09:00-24:00 хооронд - өнөөдөр
      return {
        businessDay: utc8Time.toISOString().split("T")[0],
        status: "Өнөөдөр (09:00-04:00)",
        color: "bg-green-100 text-green-800",
      };
    }
  };

  const businessDayInfo = getCurrentBusinessDayInfo();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Calendar className="w-5 h-5" />
          Бизнес горим
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label
              htmlFor="business-day-mode"
              className="text-base font-medium"
            >
              Business Day Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              {isBusinessDayMode
                ? "09:00-04:00 (маргааш) = 1 business day"
                : "00:00-23:59 = 1 өдөр"}
            </p>
          </div>
          <Switch
            id="business-day-mode"
            checked={isBusinessDayMode}
            onCheckedChange={handleBusinessDayToggle}
            disabled={isLoading}
          />
        </div>

        {/* Status Display */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Одоогийн төлөв:</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={businessDayInfo.color}>
              {isBusinessDayMode ? "Business Day" : "Хуучин логик"}
            </Badge>
            {isBusinessDayMode && (
              <Badge variant="secondary">{businessDayInfo.status}</Badge>
            )}
          </div>

          {isBusinessDayMode && (
            <div className="text-sm text-muted-foreground">
              Business Day:{" "}
              <span className="font-mono">{businessDayInfo.businessDay}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            <strong>Business Day Mode ON:</strong>
          </p>
          <ul className="ml-2 space-y-1 list-disc list-inside">
            <li>09:00-04:00 (маргааш) = 1 business day</li>
            <li>04:00-09:00 = өмнөх өдрийн business day</li>
            <li>Notification, order list бүгд business day-г ашиглана</li>
          </ul>

          <p className="mt-2">
            <strong>Business Day Mode OFF:</strong>
          </p>
          <ul className="ml-2 space-y-1 list-disc list-inside">
            <li>00:00-23:59 = 1 өдөр</li>
            <li>Хуучин логик ашиглана</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

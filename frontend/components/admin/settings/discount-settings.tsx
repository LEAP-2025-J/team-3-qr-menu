"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, Percent, Settings } from "lucide-react";
import { useDiscount } from "@/hooks/use-discount";

export function DiscountSettings() {
  const {
    discountSettings,
    loading,
    isDiscountTime,
    getDiscountInfo,
    updateDiscountSettings,
  } = useDiscount();

  const [formData, setFormData] = useState({
    discountPercentage: 1,
    discountEndTime: "19:00",
    isActive: true,
    description: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Form data-г шинэчлэх
  useEffect(() => {
    if (discountSettings) {
      setFormData({
        discountPercentage: discountSettings.discountPercentage,
        discountEndTime: discountSettings.discountEndTime,
        isActive: discountSettings.isActive,
        description: discountSettings.description,
      });
    }
  }, [discountSettings]);

  // Тохиргоог хадгалах
  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const result = await updateDiscountSettings(formData);
      if (result.success) {
        // Admin header-г шинэчлэх custom event илгээх
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("discountSettingsChanged", {
              detail: { settings: formData },
            })
          );
        }
        alert("Хөнгөлөлтийн тохиргоо амжилттай хадгалагдлаа!");
      } else {
        alert(`Алдаа: ${result.error}`);
      }
    } catch (error) {
      alert("Хадгалахад алдаа гарлаа");
    } finally {
      setIsUpdating(false);
    }
  };

  // Одоогийн хөнгөлөлтийн мэдээлэл
  const currentDiscountInfo = getDiscountInfo();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Хөнгөлөлтийн тохиргоо
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Одоогийн хөнгөлөлтийн мэдээлэл */}
        <div className="p-4 rounded-lg bg-blue-50">
          <h3 className="mb-2 font-semibold text-blue-900">
            Өнөөдрийн хөнгөлөлтийн цаг:
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={isDiscountTime() ? "default" : "secondary"}>
                {isDiscountTime() ? "Дуусаагүй байна" : "Дууссан"}
              </Badge>
              {currentDiscountInfo && (
                <span className="text-sm text-blue-700">
                  {currentDiscountInfo.percentage}% хөнгөлөлт
                </span>
              )}
            </div>
            {currentDiscountInfo && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Clock className="w-4 h-4" />
                <span>Дуусах цаг: {currentDiscountInfo.endTime}</span>
              </div>
            )}
            {currentDiscountInfo && (
              <p className="text-sm text-blue-600">
                {currentDiscountInfo.description}
              </p>
            )}
          </div>
        </div>

        {/* Тохиргооны форм */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive" className="text-base font-medium">
              Хөнгөлөлт идэвхтэй
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="discountPercentage"
                className="flex items-center gap-2"
              >
                <Percent className="w-4 h-4" />
                Хөнгөлөлтийн хувь
              </Label>
              <Input
                id="discountPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPercentage: parseInt(e.target.value) || 0,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label
                htmlFor="discountEndTime"
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Дуусах цаг
              </Label>
              <Input
                id="discountEndTime"
                type="time"
                step="3600"
                value={formData.discountEndTime}
                onChange={(e) =>
                  setFormData({ ...formData, discountEndTime: e.target.value })
                }
                className="mt-1"
                placeholder="19:00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Тайлбар</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Хөгжөөний цаг! 19:00 цагийн өмнөх бүх бараанд 1% хөнгөлөлт"
              className="mt-1 min-h-[80px] resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Хадгалах товч */}
        <div className="flex justify-center">
          <Button onClick={handleSave} disabled={isUpdating} className="w-fit">
            {isUpdating ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

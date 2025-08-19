"use client";

import { Button } from "@/components/ui/button";
import { Grid, List, Plus, RefreshCw } from "lucide-react";

interface TableHeaderProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onAddReservation: () => void;
  onRefresh: () => void;
}

export function TableHeader({
  viewMode,
  onViewModeChange,
  onAddReservation,
  onRefresh,
}: TableHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Захиалгын удирдлага
        </h1>
        <p className="mt-1 text-gray-600">
          Бүх ширээний мэдээлэл болон захиалгын статус
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
          >
            <Grid className="w-4 h-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("list")}
          >
            <List className="w-4 h-4 mr-1" />
            List
          </Button>
        </div>
        {viewMode === "list" && (
          <Button onClick={onAddReservation} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Reservation
          </Button>
        )}
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Шинэчлэх
        </Button>
      </div>
    </div>
  );
}

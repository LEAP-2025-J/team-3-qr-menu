"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Printer } from "lucide-react";
import { Order, Table } from "../types";
import { formatDate, formatTime } from "../utils";

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  table: Table;
  onPrint: () => void;
}

export function PrintModal({ isOpen, onClose, order, table, onPrint }: PrintModalProps) {
  const [printDevice, setPrintDevice] = useState("browser");
  const [copyCount, setCopyCount] = useState(1);

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Захиалга хэвлэх</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Захиалгын мэдээлэл */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Захиалгын дугаар:</span>
              <span className="text-sm">#{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Ширээний дугаар:</span>
              <span className="text-sm font-bold">{table.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Огноо:</span>
              <span className="text-lg">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Цаг:</span>
              <span className="text-lg font-bold">{formatTime(order.createdAt)}</span>
            </div>
          </div>

          {/* Захиалсан хоолнууд */}
          <div>
            <h4 className="mb-2 font-medium">Захиалсан хоол:</h4>
            <div className="space-y-2">
              {order.items
                .filter((item) => item.menuItem)
                .map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <div className="text-lg font-bold">
                        {item.menuItem?.nameMn || item.menuItem?.name || "Unknown Item"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.menuItem?.nameJp || "日本語名なし"}
                      </div>
                    </div>
                    <div className="font-bold">{item.quantity}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Тэмдэглэл */}
          {order.items.some((item) => item.specialInstructions) && (
            <div>
              <h4 className="mb-2 font-medium">Тэмдэглэл:</h4>
              <p className="text-sm text-gray-600">
                {order.items
                  .map((item) => item.specialInstructions)
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          )}

          {/* Нийт дүн */}
          <div className="flex justify-between font-bold">
            <span>Нийт дүн:</span>
            <span>$ {order.total.toLocaleString()}</span>
          </div>

          {/* Хэвлэх тохиргоо */}
          <div className="pt-4 space-y-3 border-t">
            <div>
              <Label htmlFor="print-device" className="text-sm font-medium">
                Хэвлэх төхөөрөмж:
              </Label>
              <Select value={printDevice} onValueChange={setPrintDevice}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="browser">Браузер хэвлэх</SelectItem>
                  <SelectItem value="thermal">Термал принтер</SelectItem>
                  <SelectItem value="network">Сүлжээний принтер</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="copy-count" className="text-sm font-medium">
                Хэвлэх тоо:
              </Label>
              <Input
                id="copy-count"
                type="number"
                min="1"
                max="10"
                value={copyCount}
                onChange={(e) => setCopyCount(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Үйлдлийн товчнууд */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Цуцлах
            </Button>
            <Button className="flex-1 bg-black hover:bg-gray-800" onClick={onPrint}>
              <Printer className="w-4 h-4 mr-2" />
              Хэвлэх ({copyCount} хувь)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

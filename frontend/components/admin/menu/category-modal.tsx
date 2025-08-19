"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: any) => Promise<{ success: boolean }>;
  defaultOrder?: number;
}

export function CategoryModal({ isOpen, onClose, onSubmit, defaultOrder = 1 }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    nameEn: "",
    nameMn: "",
    description: "",
    order: defaultOrder,
  });
  const [loading, setLoading] = useState(false);

  // Modal нээгдэх үед defaultOrder-ыг шинэчлэх
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, order: defaultOrder }));
    }
  }, [isOpen, defaultOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await onSubmit(formData);
    if (result.success) {
      setFormData({ nameEn: "", nameMn: "", description: "", order: defaultOrder });
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Шинэ ангилал нэмэх</DialogTitle>
          <DialogDescription>
            Цэсний шинэ ангилал үүсгэх
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nameEn">Нэр (Англи)</Label>
            <Input
              id="nameEn"
              value={formData.nameEn}
              onChange={(e) =>
                setFormData({ ...formData, nameEn: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="nameMn">Нэр (Монгол)</Label>
            <Input
              id="nameMn"
              value={formData.nameMn}
              onChange={(e) =>
                setFormData({ ...formData, nameMn: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Тайлбар</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="order">Дараалал</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Цуцлах
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Нэмж байна..." : "Нэмэх"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

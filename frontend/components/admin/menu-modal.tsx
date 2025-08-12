"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Save, X } from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
  nameEn: string;
  nameMn: string;
  description: string;
  price: number;
  category: { name: string; nameEn: string };
  image?: string;
  isAvailable: boolean;
  isSpicy: boolean;
  preparationTime: number;
}

interface Category {
  _id: string;
  name: string;
  nameEn: string;
  nameMn: string;
  description: string;
  order: number;
}

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditMode: boolean;
  currentItem: MenuItem | null;
  categories: Category[];
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export const MenuModal = ({
  isOpen,
  onClose,
  isEditMode,
  currentItem,
  categories,
  onSubmit,
}: MenuModalProps) => {
  const [formData, setFormData] = useState({
    nameEn: "",
    nameMn: "",
    description: "",
    price: 0,
    categoryNameEn: "",
    image: "",
    isAvailable: true,
    isSpicy: false,
    preparationTime: 15,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modal нээгдэх үед form data-г шинэчлэх
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nameEn: currentItem?.nameEn || "",
        nameMn: currentItem?.nameMn || "",
        description: currentItem?.description || "",
        price: currentItem?.price || 0,
        categoryNameEn: currentItem?.category?.nameEn || "",
        image: currentItem?.image || "",
        isAvailable: currentItem?.isAvailable ?? true,
        isSpicy: currentItem?.isSpicy ?? false,
        preparationTime: currentItem?.preparationTime || 15,
      });
      setSelectedFile(null);
      setImagePreview(currentItem?.image || "");
      setMessage(null); // Success message-г цэвэрлэх
    }
  }, [isOpen, currentItem, isEditMode]);

  // File select handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // FormData үүсгэх
      const formDataToSend = new FormData();
      formDataToSend.append("nameEn", formData.nameEn);
      formDataToSend.append("nameMn", formData.nameMn);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price.toString());
      formDataToSend.append("categoryNameEn", formData.categoryNameEn);
      formDataToSend.append("isAvailable", formData.isAvailable.toString());
      formDataToSend.append("isSpicy", formData.isSpicy.toString());
      formDataToSend.append(
        "preparationTime",
        formData.preparationTime.toString()
      );

      // Хэрэв шинэ файл сонгосон бол нэмэх
      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      } else if (formData.image) {
        // Хэрэв URL байвал image талбарт хадгалах
        formDataToSend.append("image", formData.image);
      }

      const result = await onSubmit(formDataToSend);

      if (result?.success) {
        setMessage({
          type: "success",
          text: result.message || "Амжилттай хадгаллаа",
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage({ type: "error", text: result?.error || "Алдаа гарлаа" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Алдаа гарлаа" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Бараа засах" : "Шинэ бараа нэмэх"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Барааны мэдээллийг засна уу"
              : "Шинэ барааны мэдээллийг оруулна уу"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-md ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nameEn">Нэр (Англи)</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
                placeholder="English name"
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
                placeholder="Монгол нэр"
                required
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
              placeholder="Барааны тайлбар"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Үнэ</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="categoryNameEn">Категори</Label>
              <Select
                value={formData.categoryNameEn}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryNameEn: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Категори сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category.nameEn}>
                      {category.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="image">Зураг</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="preparationTime">Бэлтгэх хугацаа (мин)</Label>
              <Input
                id="preparationTime"
                type="number"
                value={formData.preparationTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preparationTime: parseInt(e.target.value) || 15,
                  })
                }
                placeholder="15"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isAvailable: checked })
                }
              />
              <Label htmlFor="isAvailable">Боломжтой</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isSpicy"
                checked={formData.isSpicy}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isSpicy: checked })
                }
              />
              <Label htmlFor="isSpicy">Халуун</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Цуцлах
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Хадгалж байна..." : isEditMode ? "Хадгалах" : "Нэмэх"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

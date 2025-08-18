import { Order } from "../types";
import { API_CONFIG } from "@/config/api";

// Захиалгын статусын өнгө
export function getOrderStatusColor(status: Order["status"]): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "preparing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ready":
      return "bg-green-100 text-green-800 border-green-200";
    case "completed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// Захиалгын статусын текст
export function getOrderStatusText(status: Order["status"]): string {
  switch (status) {
    case "pending":
      return "Хүлээгдэж буй";
    case "preparing":
      return "Бэлтгэж байна";
    case "ready":
      return "Бэлэн";
    case "completed":
      return "Дууссан";
    case "cancelled":
      return "Цуцлагдсан";
    default:
      return status;
  }
}

// Дараагийн статус
export function getNextStatus(currentStatus: Order["status"]): Order["status"] {
  switch (currentStatus) {
    case "pending":
      return "preparing";
    case "preparing":
      return "ready";
    case "ready":
      return "completed";
    default:
      return currentStatus;
  }
}

// Үндсэн үйлдлийн товчны текст
export function getPrimaryActionLabel(status: Order["status"]): string {
  switch (status) {
    case "pending":
      return "Хэвлэх";
    case "preparing":
      return "Бэлэн болгох";
    case "ready":
      return "Дуусгах";
    default:
      return "Дараагийн алхам";
  }
}

// Статус шинэчлэх API дуудах
export async function requestUpdateStatus(
  orderId: string,
  status: Order["status"]
): Promise<boolean> {
  const res = await fetch(`${API_CONFIG.BACKEND_URL}/api/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    console.error("Захиалгын статус шинэчлэхэд алдаа гарлаа");
  }
  return res.ok;
}

import express from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getNotifications,
  markOrdersAsRead,
} from "../controllers/order.controller.js";

const router = express.Router();

// GET /api/orders - Get all orders
router.get("/", getAllOrders);

// GET /api/orders/notifications - Get notifications (захиалгын тоо)
router.get("/notifications", getNotifications);

// POST /api/orders/mark-as-read - Mark notifications as read
router.post("/mark-as-read", markOrdersAsRead);

// GET /api/orders/:id - Get single order
router.get("/:id", getOrderById);

// POST /api/orders - Create new order
router.post("/", createOrder);

// PATCH /api/orders/:id - Update order status
router.patch("/:id", updateOrderStatus);

export default router;

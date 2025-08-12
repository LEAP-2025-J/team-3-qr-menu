import { Request, Response } from "express";
import Order from "../models/model.order.js";
import Table from "../models/model.table.js";
import MenuItem from "../models/model.menuItem.js";

// GET /api/orders - Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status, table, limit = 50, page = 1 } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (table) {
      query.table = table;
    }

    const orders = await Order.find(query)
      .populate("table", "number")
      .populate("items.menuItem", "name nameEn price")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Order.countDocuments(query);

    return res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};

// GET /api/orders/:id - Get single order
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params["id"])
      .populate("table", "number")
      .populate("items.menuItem", "name nameEn price image");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch order",
    });
  }
};

// POST /api/orders - Create new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { tableId, items, customerName, customerPhone, specialRequests } =
      req.body;

    // Validate table exists and is available
    const table = await (Table as any).findById(tableId);
    if (!table) {
      return res.status(404).json({ success: false, error: "Table not found" });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];
    let maxPrepTime = 15; // Default preparation time

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          error: `Menu item ${item.menuItemId} not found`,
        });
      }

      if (!menuItem.isAvailable) {
        return res
          .status(400)
          .json({ success: false, error: `${menuItem.name} is not available` });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      // Update max preparation time
      if (menuItem.preparationTime && menuItem.preparationTime > maxPrepTime) {
        maxPrepTime = menuItem.preparationTime;
      }

      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions,
      });
    }

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Calculate estimated time
    const estimatedTime = maxPrepTime + orderItems.length * 2; // Base time + 2 min per item

    const order = new Order({
      table: tableId,
      items: orderItems,
      subtotal,
      tax,
      total,
      customerName,
      customerPhone,
      specialRequests,
      estimatedTime,
    });

    await order.save();

    // Update table status
    await (Table as any).findByIdAndUpdate(tableId, {
      status: "occupied",
      currentOrder: order._id,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("table", "number")
      .populate("items.menuItem", "name nameEn price preparationTime");

    return res.status(201).json({
      success: true,
      data: populatedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ success: false, error: "Failed to create order" });
  }
};

// PATCH /api/orders/:id - Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params["id"],
      { status },
      { new: true, runValidators: true }
    ).populate("table", "number");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Update table status if order is completed
    if (status === "completed") {
      await (Table as any).findByIdAndUpdate(order.table._id, {
        status: "cleaning",
        currentOrder: null,
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update order",
    });
  }
};

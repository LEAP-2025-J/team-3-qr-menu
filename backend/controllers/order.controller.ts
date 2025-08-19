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
      .populate("table", "number location")
      .populate("items.menuItem", "name nameEn nameMn nameJp price")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
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
    res.status(500).json({
      success: false,
      error: "Захиалгын мэдээллийг авахад алдаа гарлаа",
    });
  }
};

// GET /api/orders/:id - Get single order
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params["id"])
      .populate("table", "number location")
      .populate("items.menuItem", "name nameEn nameMn nameJp price image");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Захиалга олдсонгүй",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      error: "Захиалга авахад алдаа гарлаа",
    });
  }
};

// POST /api/orders - Create new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      tableNumber,
      tableId,
      items,
      customerName = "",
      customerPhone = "",
      specialRequests = "",
    } = req.body;

    // Find table by id or number
    let table: any | null = null;
    if (tableId) {
      table = await (Table as any).findById(tableId);
    }
    if (!table && tableNumber) {
      const n = Number(tableNumber);
      if (!Number.isNaN(n)) {
        table = await (Table as any).findOne({ number: n });
      }
    }
    if (!table) {
      return res.status(404).json({
        success: false,
        error: "Ширээ олдсонгүй",
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];
    let maxPrepTime = 15; // Default preparation time

    for (const item of items) {
      const menuItemId = item.menuItem || item.menuItemId || item.id;
      const menuItem = await MenuItem.findById(menuItemId);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          error: `Хоол ${menuItemId} олдсонгүй`,
        });
      }

      if (!menuItem.isAvailable) {
        return res
          .status(400)
          .json({ success: false, error: `${menuItem.name} боломжгүй байна` });
      }

      const itemTotal = item.price * item.quantity; // Frontend-ээс ирсэн үнийг ашиглах
      subtotal += itemTotal;

      // Update max preparation time
      if (menuItem.preparationTime && menuItem.preparationTime > maxPrepTime) {
        maxPrepTime = menuItem.preparationTime;
      }

      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: item.price, // Frontend-ээс ирсэн үнэг ашиглах
        specialInstructions: item.specialInstructions || "",
      });
    }

    const tax = subtotal * 0.1; // 10% tax
    const calculatedTotal = subtotal + tax;

    // Frontend-ээс ирсэн total-г ашиглах, эсвэл тооцоолсон total-г ашиглах
    const total = req.body.total || calculatedTotal;

    // Calculate estimated time
    const estimatedTime = maxPrepTime + orderItems.length * 2; // Base time + 2 min per item

    const order = new Order({
      table: table._id,
      items: orderItems,
      subtotal,
      tax,
      total,
      customerName,
      customerPhone,
      specialRequests,
      estimatedTime,
      status: "pending",
    });

    await order.save();

    // Update table status to reserved
    await (Table as any).findByIdAndUpdate(table._id, {
      status: "reserved",
      currentOrder: order._id,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("table", "number location")
      .populate(
        "items.menuItem",
        "name nameEn nameMn nameJp price preparationTime"
      );

    res.status(201).json({
      success: true,
      message: "Захиалга амжилттай үүсгэгдлээ",
      data: populatedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      error: "Захиалга үүсгэхэд алдаа гарлаа",
    });
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
    ).populate("table", "number location");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Захиалга олдсонгүй",
      });
    }

    // Update table status based on order status
    if (status === "completed" || status === "cancelled") {
      await (Table as any).findByIdAndUpdate(
        order.table._id,
        {
          status: "empty",
          currentOrder: null,
        },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: "Захиалгын статус амжилттай шинэчлэгдлээ",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      error: "Захиалгын статус шинэчлэхэд алдаа гарлаа",
    });
  }
};

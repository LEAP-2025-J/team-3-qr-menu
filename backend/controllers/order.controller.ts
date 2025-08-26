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

    // Update table status to reserved and add order to orders array
    await (Table as any).findByIdAndUpdate(table._id, {
      status: "reserved",
      currentOrder: order._id,
      $push: { orders: order._id }, // Захиалгыг orders array-д нэмэх
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
      // Хэрэв тухайн ширээнд өөр идэвхтэй захиалга байвал currentOrder-г шинэчлэхгүй
      const activeOrders = await Order.find({
        table: order.table._id,
        status: { $nin: ["completed", "cancelled"] },
      }).sort({ createdAt: -1 });

      if (activeOrders.length === 0) {
        // Идэвхтэй захиалга байхгүй бол ширээг хоосон болгох
        await (Table as any).findByIdAndUpdate(
          order.table._id,
          {
            status: "empty",
            currentOrder: null,
          },
          { new: true }
        );
      } else {
        // Хамгийн сүүлийн идэвхтэй захиалгыг currentOrder болгох
        await (Table as any).findByIdAndUpdate(
          order.table._id,
          {
            currentOrder: activeOrders[0]._id,
          },
          { new: true }
        );
      }
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

// GET /api/orders/notifications - Get unread QR orders count for notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    console.log("🚀 getNotifications endpoint called");
    // Өнөөдрийн QR захиалгуудыг авах (unread статустай) - MongoDB UTC+0 дээр хадгалагдсан захиалгуудыг шалгах
    const now = new Date();
    // Mongolia timezone (UTC+8) дээр өнөөдрийн огноог тооцоолох
    const mongoliaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    // MongoDB-д хадгалагдсан UTC+0 цагтай харьцуулахын тулд Mongolia огнооны range-г UTC+0 дээр буцаах
    const todayStart = new Date(mongoliaTime);
    todayStart.setHours(0, 0, 0, 0);
    const todayStartUTC = new Date(todayStart.getTime() - 8 * 60 * 60 * 1000); // UTC+0 руу буцаах

    const todayEnd = new Date(mongoliaTime);
    todayEnd.setHours(23, 59, 59, 999);
    const todayEndUTC = new Date(todayEnd.getTime() - 8 * 60 * 60 * 1000); // UTC+0 руу буцаах

    console.log("📅 Date range (Mongolia timezone converted to UTC):", {
      mongoliaTime,
      todayStartUTC,
      todayEndUTC,
    });

    // Badge дээр харуулах зөвхөн unread захиалгууд
    const unreadQROrders = await Order.find({
      status: "pending",
      isReadByAdmin: false, // Зөвхөн хараагүй захиалгууд
      createdAt: {
        $gte: todayStartUTC,
        $lte: todayEndUTC,
      },
    })
      .populate("table", "number location")
      .lean();

    // Dialog дээр харуулах өнөөдрийн бүх QR захиалгууд (read болон unread)
    const todayQROrders = await Order.find({
      createdAt: {
        $gte: todayStartUTC,
        $lte: todayEndUTC,
      },
    })
      .populate("table", "number location")
      .populate("items.menuItem", "name nameEn nameMn nameJp")
      .sort({ createdAt: -1 }) // Хамгийн сүүлд үүсгэсэн захиалга дээрээ
      .lean();

    console.log(
      "🔍 Raw todayQROrders query result:",
      todayQROrders.length,
      "orders"
    );
    todayQROrders.forEach((order, index) => {
      console.log(`📋 Order ${index + 1}:`, {
        id: order._id,
        orderNumber: order.orderNumber,
        tableNumber: order.table ? (order.table as any).number : "N/A",
        status: order.status,
        createdAt: order.createdAt,
      });
    });

    // Debug: Хамгийн сүүлд үүсгэсэн захиалгуудыг шалгах
    const recentOrders = todayQROrders.slice(0, 5); // Эхний 5 захиалга
    console.log(
      "🔍 Recent orders (first 5):",
      recentOrders.map((order) => ({
        orderNumber: order.orderNumber,
        tableNumber: order.table ? (order.table as any).number : "N/A",
        status: order.status,
        createdAt: order.createdAt,
      }))
    );

    // Unread захиалгатай ширээний тоо (unique table count)
    const uniqueTables = new Set();
    unreadQROrders.forEach((order) => {
      if (order.table && (order.table as any).number) {
        uniqueTables.add((order.table as any).number);
      }
    });

    const unreadTableCount = uniqueTables.size;

    console.log("🔍 Today QR Orders found:", todayQROrders.length);
    console.log("📊 Unread QR Orders found:", unreadQROrders.length);
    console.log("🏷️ Unique tables with unread orders:", uniqueTables.size);

    // Debug: 3-р ширээний захиалгуудыг шалгах
    const table3Orders = todayQROrders.filter(
      (order) => order.table && (order.table as any).number === 3
    );
    console.log("🔍 Table 3 orders in todayQROrders:", table3Orders.length);
    table3Orders.forEach((order) => {
      console.log("📋 Table 3 order:", {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        tableNumber: (order.table as any).number,
      });
    });

    res.json({
      success: true,
      data: {
        unreadTableCount, // Үүгээр notification badge дээр харуулна
        todayQROrders, // Dialog-д харуулах бүх захиалга
        totalTodayOrders: todayQROrders.length,
      },
    });
  } catch (error) {
    console.error("💥 Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      error: "Notification-ын мэдээлэл авахад алдаа гарлаа",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// POST /api/orders/mark-as-read - Mark today's QR orders as read by admin
export const markOrdersAsRead = async (req: Request, res: Response) => {
  try {
    // Өнөөдрийн өдрийн эхлэл болон төгсгөл - MongoDB UTC+0 дээр хадгалагдсан захиалгуудыг шалгах
    const now = new Date();
    // Mongolia timezone (UTC+8) дээр өнөөдрийн огноог тооцоолох
    const mongoliaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    // MongoDB-д хадгалагдсан UTC+0 цагтай харьцуулахын тулд Mongolia огнооны range-г UTC+0 дээр буцаах
    const todayStart = new Date(mongoliaTime);
    todayStart.setHours(0, 0, 0, 0);
    const todayStartUTC = new Date(todayStart.getTime() - 8 * 60 * 60 * 1000); // UTC+0 руу буцаах

    const todayEnd = new Date(mongoliaTime);
    todayEnd.setHours(23, 59, 59, 999);
    const todayEndUTC = new Date(todayEnd.getTime() - 8 * 60 * 60 * 1000); // UTC+0 руу буцаах

    // Өнөөдрийн бүх pending захиалгуудыг "харсан" болгох
    const updateResult = await Order.updateMany(
      {
        status: "pending",
        isReadByAdmin: false,
        createdAt: {
          $gte: todayStartUTC,
          $lte: todayEndUTC,
        },
      },
      {
        $set: { isReadByAdmin: true },
      }
    );

    res.json({
      success: true,
      message: "Захиалгууд харсан болж тэмдэглэгдлээ",
      data: {
        modifiedCount: updateResult.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Error marking orders as read:", error);
    res.status(500).json({
      success: false,
      error: "Захиалгуудыг харсан болгоход алдаа гарлаа",
    });
  }
};

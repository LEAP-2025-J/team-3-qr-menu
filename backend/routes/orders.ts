import express, { Request, Response } from "express"
import Order from "../models/Order.js"
import Table from "../models/Table.js"
import MenuItem from "../models/MenuItem.js"

const router = express.Router()

// GET /api/orders - Get all orders
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, table, limit = 50, page = 1 } = req.query
    const query: any = {}

    if (status) {
      query.status = status
    }

    if (table) {
      query.table = table
    }

    const orders = await Order.find(query)
      .populate("table", "number")
      .populate("items.menuItem", "name nameEn price")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean()

    const total = await Order.countDocuments(query)

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({ success: false, error: "Failed to fetch orders" })
  }
})

// GET /api/orders/:id - Get single order
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("table", "number")
      .populate("items.menuItem", "name nameEn price image")

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      })
    }

    res.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch order",
    })
  }
})

// POST /api/orders - Create new order
router.post("/", async (req: Request, res: Response) => {
  try {
    const { tableId, items, customerName, customerPhone, specialRequests } = req.body

    // Validate table exists and is available
    const table = await Table.findById(tableId)
    if (!table) {
      return res.status(404).json({ success: false, error: "Table not found" })
    }

    // Calculate totals
    let subtotal = 0
    const orderItems: any[] = []

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId)
      if (!menuItem) {
        return res.status(404).json({ success: false, error: `Menu item ${item.menuItemId} not found` })
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({ success: false, error: `${menuItem.name} is not available` })
      }

      const itemTotal = menuItem.price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions,
      })
    }

    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    // Calculate estimated time
    const maxPrepTime = Math.max(...orderItems.map((item) => item.menuItem.preparationTime || 15))
    const estimatedTime = maxPrepTime + orderItems.length * 2 // Base time + 2 min per item

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
    })

    await order.save()

    // Update table status
    await Table.findByIdAndUpdate(tableId, {
      status: "occupied",
      currentOrder: order._id,
    })

    const populatedOrder = await Order.findById(order._id)
      .populate("table", "number")
      .populate("items.menuItem", "name nameEn price preparationTime")

    res.status(201).json({
      success: true,
      data: populatedOrder,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    res.status(500).json({ success: false, error: "Failed to create order" })
  }
})

// PATCH /api/orders/:id - Update order status
router.patch(
  "/:id",
  [
    body("status")
      .isIn(["pending", "confirmed", "preparing", "ready", "served", "completed", "cancelled"])
      .withMessage("Invalid status"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        })
      }

      const { status } = req.body

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true },
      ).populate("table", "number")

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Order not found",
        })
      }

      // Update table status if order is completed
      if (status === "completed") {
        await Table.findByIdAndUpdate(order.table._id, {
          status: "cleaning",
          currentOrder: null,
        })
      }

      res.json({
        success: true,
        data: order,
      })
    } catch (error) {
      console.error("Error updating order:", error)
      res.status(500).json({
        success: false,
        error: "Failed to update order",
      })
    }
  },
)

export default router

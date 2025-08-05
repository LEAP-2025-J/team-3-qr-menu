import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/frontend/lib/mongodb"
import Order from "@/backend/models1/Order"
import Table from "@/backend/models1/Table"
import MenuItem from "@/backend/models1/MenuItem"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const table = searchParams.get("table")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")

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
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    const total = await Order.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { tableId, items, customerName, customerPhone, specialRequests } = body

    // Validate table exists and is available
    const table = await Table.findById(tableId)
    if (!table) {
      return NextResponse.json({ success: false, error: "Table not found" }, { status: 404 })
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId)
      if (!menuItem) {
        return NextResponse.json({ success: false, error: `Menu item ${item.menuItemId} not found` }, { status: 404 })
      }

      if (!menuItem.isAvailable) {
        return NextResponse.json({ success: false, error: `${menuItem.name} is not available` }, { status: 400 })
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

    return NextResponse.json(
      {
        success: true,
        data: populatedOrder,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
  }
}

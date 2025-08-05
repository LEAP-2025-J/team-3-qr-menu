import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/frontend/lib/mongodb"
import Order from "@/backend/models1/Order"
import Table from "@/backend/models1/Table"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const order = await Order.findById(params.id)
      .populate("table", "number")
      .populate("items.menuItem", "name nameEn price image")

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await request.json()
    const { status } = body

    const order = await Order.findByIdAndUpdate(params.id, { status }, { new: true, runValidators: true }).populate(
      "table",
      "number",
    )

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    // Update table status if order is completed
    if (status === "completed") {
      await Table.findByIdAndUpdate(order.table._id, {
        status: "cleaning",
        currentOrder: null,
      })
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
  }
}

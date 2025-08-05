import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/frontend/lib/mongodb"
import MenuItem from "@/backend/models1/MenuItem"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const available = searchParams.get("available")

    const query: any = {}

    if (category) {
      query.category = category
    }

    if (available === "true") {
      query.isAvailable = true
    }

    const menuItems = await MenuItem.find(query)
      .populate("category", "name nameEn nameMn")
      .sort({ order: 1, name: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: menuItems,
    })
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch menu items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const menuItem = new MenuItem(body)
    await menuItem.save()

    const populatedItem = await MenuItem.findById(menuItem._id).populate("category", "name nameEn nameMn")

    return NextResponse.json(
      {
        success: true,
        data: populatedItem,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating menu item:", error)
    return NextResponse.json({ success: false, error: "Failed to create menu item" }, { status: 500 })
  }
}

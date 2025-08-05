import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/frontend/lib/mongodb"
import Table from "@/backend/models1/Table"

export async function GET() {
  try {
    await dbConnect()

    const tables = await Table.find({ isActive: true })
      .populate("currentOrder", "orderNumber status total")
      .sort({ number: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: tables,
    })
  } catch (error) {
    console.error("Error fetching tables:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tables" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { number, capacity, location } = body

    // Generate QR code URL
    const qrCode = `${process.env.NEXT_PUBLIC_BASE_URL}?table=${number}`

    const table = new Table({
      number,
      capacity,
      location,
      qrCode,
    })

    await table.save()

    return NextResponse.json(
      {
        success: true,
        data: table,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating table:", error)
    return NextResponse.json({ success: false, error: "Failed to create table" }, { status: 500 })
  }
}

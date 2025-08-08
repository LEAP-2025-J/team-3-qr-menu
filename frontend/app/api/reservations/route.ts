import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Reservation from "@/models1/Reservation"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const status = searchParams.get("status")

    const query: any = {}

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)

      query.date = {
        $gte: startDate,
        $lt: endDate,
      }
    }

    if (status) {
      query.status = status
    }

    const reservations = await Reservation.find(query).populate("table", "number").sort({ date: 1, time: 1 }).lean()

    return NextResponse.json({
      success: true,
      data: reservations,
    })
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch reservations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const reservation = new Reservation(body)
    await reservation.save()

    return NextResponse.json(
      {
        success: true,
        data: reservation,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json({ success: false, error: "Failed to create reservation" }, { status: 500 })
  }
}

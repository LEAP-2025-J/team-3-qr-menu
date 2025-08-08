import express, { Request, Response } from "express"
import Reservation from "../models/Reservation.js"

const router = express.Router()

// GET /api/reservations - Get all reservations
router.get("/", async (req: Request, res: Response) => {
  try {
    const { date, status } = req.query
    const query: any = {}

    if (date) {
      const startDate = new Date(date as string)
      const endDate = new Date(date as string)
      endDate.setDate(endDate.getDate() + 1)

      query.date = {
        $gte: startDate,
        $lt: endDate,
      }
    }

    if (status) {
      query.status = status
    }

    const reservations = await Reservation.find(query)
      .populate("table", "number")
      .sort({ date: 1, time: 1 })
      .lean()

    res.json({
      success: true,
      data: reservations,
    })
  } catch (error) {
    console.error("Error fetching reservations:", error)
    res.status(500).json({ success: false, error: "Failed to fetch reservations" })
  }
})

// POST /api/reservations - Create new reservation
router.post("/", async (req: Request, res: Response) => {
  try {
    const reservation = new Reservation(req.body)
    await reservation.save()

    res.status(201).json({
      success: true,
      data: reservation,
    })
  } catch (error) {
    console.error("Error creating reservation:", error)
    res.status(500).json({ success: false, error: "Failed to create reservation" })
  }
})

export default router 
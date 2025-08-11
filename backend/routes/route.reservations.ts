import express from "express"
import {
  getAllReservations,
  createReservation
} from "../controllers/reservation.controller.js"

const router = express.Router()

// GET /api/reservations - Get all reservations
router.get("/", getAllReservations)

// POST /api/reservations - Create new reservation
router.post("/", createReservation)

export default router 
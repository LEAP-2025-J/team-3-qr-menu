import express from "express"
import {
  getAllReservations,
  createReservation,
  updateReservation,
  cancelReservation,
  deleteReservation,
  cleanupOldReservations
} from "../controllers/reservation.controller.js"

const router = express.Router()

// GET /api/reservations - Get all reservations
router.get("/", getAllReservations)

// POST /api/reservations - Create new reservation
router.post("/", createReservation)

// PATCH /api/reservations/:id - Update reservation
router.patch("/:id", updateReservation)

// DELETE /api/reservations/:id - Cancel reservation
router.delete("/:id", cancelReservation)

// DELETE /api/reservations/:id/delete - Delete reservation permanently
router.delete("/:id/delete", deleteReservation)

// POST /api/reservations/cleanup - Manual cleanup trigger
router.post("/cleanup", cleanupOldReservations)

export default router 
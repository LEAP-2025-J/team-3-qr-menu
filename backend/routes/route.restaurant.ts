import express from "express"
import { getRestaurantSettings, updateRestaurantSettings } from "../controllers/restaurant.controller"

const router = express.Router()

// GET /api/restaurant - Get restaurant settings
router.get("/", getRestaurantSettings)

// PUT /api/restaurant - Update restaurant settings
router.put("/", updateRestaurantSettings)

export default router 
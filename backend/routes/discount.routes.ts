import express from "express";
import {
  getDiscountSettings,
  updateDiscountSettings,
  getDiscountHistory,
} from "../controllers/discount.controller.js";

const router = express.Router();

// Хөнгөлөлтийн тохиргоог авах
router.get("/settings", getDiscountSettings);

// Хөнгөлөлтийн тохиргоог шинэчлэх
router.put("/settings", updateDiscountSettings);

// Хөнгөлөлтийн түүхийг авах
router.get("/history", getDiscountHistory);

export default router;

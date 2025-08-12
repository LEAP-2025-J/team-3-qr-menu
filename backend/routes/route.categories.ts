import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

// GET /api/categories - Get all categories
router.get("/", getAllCategories);

// POST /api/categories - Create new category
router.post("/", createCategory);

// GET /api/categories/:id - Get single category
router.get("/:id", getCategoryById);

export default router;

import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

// GET /api/categories - Get all categories
router.get("/", getAllCategories);

// POST /api/categories - Create new category
router.post("/", createCategory);

// GET /api/categories/:id - Get single category
router.get("/:id", getCategoryById);

// DELETE /api/categories/:id - Delete category
router.delete("/:id", deleteCategory);

export default router;

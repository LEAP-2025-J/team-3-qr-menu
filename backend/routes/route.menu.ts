import express from "express";
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menu.controller.js";

const router = express.Router();

// GET /api/menu - Get all menu items
router.get("/", getAllMenuItems);

// GET /api/menu/:id - Get single menu item
router.get("/:id", getMenuItemById);

// POST /api/menu - Create new menu item
router.post("/", createMenuItem);

// PUT /api/menu/:id - Update menu item
router.put("/:id", updateMenuItem);

// DELETE /api/menu/:id - Delete menu item
router.delete("/:id", deleteMenuItem);

export default router;

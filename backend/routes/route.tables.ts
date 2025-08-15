import express from "express";
import {
  getAllTables,
  createTable,
  updateTableStatus,
  clearTableOrder,
} from "../controllers/table.controller.js";

const router = express.Router();

// GET /api/tables - Get all tables
router.get("/", getAllTables);

// POST /api/tables - Create new table
router.post("/", createTable);

// PUT /api/tables/:id/status - Update table status
router.put("/:id/status", updateTableStatus);

// PATCH /api/tables/:id/clear-order - Clear table's currentOrder
router.patch("/:id/clear-order", clearTableOrder);

export default router;

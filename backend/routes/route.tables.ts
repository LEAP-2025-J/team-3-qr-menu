import express from "express";
import {
  getAllTables,
  createTable,
  updateTableStatus,
} from "../controllers/table.controller.js";

const router = express.Router();

// GET /api/tables - Get all tables
router.get("/", getAllTables);

// POST /api/tables - Create new table
router.post("/", createTable);

// PUT /api/tables/:id/status - Update table status
router.put("/:id/status", updateTableStatus);

export default router;

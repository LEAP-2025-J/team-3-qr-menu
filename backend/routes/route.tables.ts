import express from "express"
import {
  getAllTables,
  createTable,
  updateTable
} from "../controllers/table.controller.js"

const router = express.Router()

// GET /api/tables - Get all tables
router.get("/", getAllTables)

// POST /api/tables - Create new table
router.post("/", createTable)

// PATCH /api/tables/:id - Update table
router.patch("/:id", updateTable)

export default router 
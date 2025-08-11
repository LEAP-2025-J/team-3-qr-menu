import express from "express"
import {
  getAllTables,
  createTable
} from "../controllers/table.controller.js"

const router = express.Router()

// GET /api/tables - Get all tables
router.get("/", getAllTables)

// POST /api/tables - Create new table
router.post("/", createTable)

export default router 
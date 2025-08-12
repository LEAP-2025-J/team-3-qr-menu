import { Request, Response } from "express";
import Table from "../models/model.table.js";

// GET /api/tables - Get all tables
export const getAllTables = async (req: Request, res: Response) => {
  try {
    const tables = await (Table as any).find({ isActive: true })
      .populate("currentOrder", "orderNumber status total")
      .sort({ number: 1 })
      .lean();

    res.json({
      success: true,
      data: tables,
    });
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ success: false, error: "Failed to fetch tables" });
  }
};

// POST /api/tables - Create new table
export const createTable = async (req: Request, res: Response) => {
  try {
    const { number, capacity, location } = req.body;

    // Generate QR code URL
    const qrCode = `${
      process.env["FRONTEND_URL"] || "http://localhost:3000"
    }?table=${number}`;

    const table = new Table({
      number,
      capacity,
      location,
      qrCode,
    });

    await table.save();

    res.status(201).json({
      success: true,
      data: table,
    });
  } catch (error) {
    console.error("Error creating table:", error);
    res.status(500).json({ success: false, error: "Failed to create table" });
  }
};

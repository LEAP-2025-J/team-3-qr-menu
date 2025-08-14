import { Request, Response } from "express";
import Table from "../models/model.table";

// GET /api/tables - Get all tables
export const getAllTables = async (req: Request, res: Response) => {
  try {
    const tables = await Table.find({ isActive: true })
      .populate({
        path: "currentOrder",
        populate: {
          path: "items.menuItem",
          select: "name nameEn nameMn nameJp price",
        },
      })
      .sort({ location: 1, number: 1 })
      .lean();

    res.json({
      success: true,
      data: tables,
    });
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({
      success: false,
      error: "Ширээний мэдээллийг авахад алдаа гарлаа",
    });
  }
};

// POST /api/tables - Create new table
export const createTable = async (req: Request, res: Response) => {
  try {
    const { number, capacity, location } = req.body;

    // Validation
    if (!number || !location) {
      return res.status(400).json({
        success: false,
        error: "Ширээний дугаар болон байрлал заавал оруулах шаардлагатай",
      });
    }

    // Check if table number already exists
    const existingTable = await Table.findOne({ number });
    if (existingTable) {
      return res.status(400).json({
        success: false,
        error: "Ийм дугаартай ширээ аль хэдийн байна",
      });
    }

    // Generate QR code URL
    const qrCode = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/menu?table=${number}`;

    const table = new Table({
      number,
      capacity: capacity || 4,
      location,
      qrCode,
    });

    await table.save();

    res.status(201).json({
      success: true,
      message: "Ширээ амжилттай нэмэгдлээ",
      data: table,
    });
  } catch (error) {
    console.error("Error creating table:", error);
    res.status(500).json({
      success: false,
      error: "Ширээ нэмэхэд алдаа гарлаа",
    });
  }
};

// PUT /api/tables/:id/status - Update table status
export const updateTableStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const tableId = req.params["id"];

    const table = await Table.findByIdAndUpdate(
      tableId,
      { status },
      { new: true }
    ).populate({
      path: "currentOrder",
      populate: {
        path: "items.menuItem",
        select: "name nameEn nameMn nameJp price",
      },
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        error: "Ширээ олдсонгүй",
      });
    }

    res.json({
      success: true,
      message: "Ширээний статус амжилттай шинэчлэгдлээ",
      data: table,
    });
  } catch (error) {
    console.error("Error updating table status:", error);
    res.status(500).json({
      success: false,
      error: "Ширээний статус шинэчлэхэд алдаа гарлаа",
    });
  }
};

// PATCH /api/tables/:id - Update table
export const updateTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const table = await Table.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!table) {
      return res.status(404).json({ 
        success: false, 
        error: "Table not found" 
      });
    }

    res.json({
      success: true,
      data: table,
    });
  } catch (error) {
    console.error("Error updating table:", error);
    res.status(500).json({ success: false, error: "Failed to update table" });
  }
};

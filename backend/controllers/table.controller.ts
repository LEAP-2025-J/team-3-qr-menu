import { Request, Response } from "express";
import Table from "../models/model.table.js";

// GET /api/tables - Get all tables or specific table by number
export const getAllTables = async (req: Request, res: Response) => {
  try {
    const { number } = req.query;

    let query: any = { isActive: true };
    if (number) {
      query = { ...query, number: parseInt(number as string) };
    }

    const tables = await (Table as any)
      .find(query)
      .populate({
        path: "currentOrder",
        populate: {
          path: "items.menuItem",
          select: "name nameEn nameMn nameJp price",
        },
      })
      .populate({
        path: "orders",
        populate: {
          path: "items.menuItem",
          select: "name nameEn nameMn nameJp price",
        },
        options: { sort: { createdAt: -1 } }, // Хамгийн сүүлийн захиалга эхэндээ
      })
      .sort({ location: 1, number: 1 })
      .lean();

    // Хоосон ширээнүүдийн currentOrder-г null болгох
    const processedTables = tables.map((table: any) => {
      // Хэрэв currentOrder байхгүй эсвэл orders array хоосон бол хоосон ширээ
      if (!table.currentOrder || !table.orders || table.orders.length === 0) {
        return {
          ...table,
          currentOrder: null,
          orders: [],
          status: "empty", // Хоосон ширээний статус
        };
      }

      // currentOrder байгаа ч тухайн захиалга дууссан/цуцлагдсан бол currentOrder-г null болгох
      if (table.currentOrder) {
        const currentOrderStatus = table.currentOrder.status;
        if (
          currentOrderStatus === "completed" ||
          currentOrderStatus === "cancelled"
        ) {
          return {
            ...table,
            currentOrder: null,
            status: "empty", // Хоосон ширээний статус
          };
        }
      }

      // Хамгийн сүүлийн идэвхтэй захиалгыг currentOrder болгох
      if (table.orders && table.orders.length > 0) {
        const activeOrders = table.orders.filter(
          (order: any) =>
            order.status === "pending" ||
            order.status === "preparing" ||
            order.status === "serving"
        );

        if (activeOrders.length > 0) {
          // Хамгийн сүүлийн идэвхтэй захиалгыг currentOrder болгох
          const latestActiveOrder = activeOrders[0]; // sort({ createdAt: -1 }) учраас эхнийх нь хамгийн сүүлийнх
          return {
            ...table,
            currentOrder: latestActiveOrder,
            status: "reserved",
          };
        } else {
          // Идэвхтэй захиалга байхгүй бол хоосон ширээ
          return {
            ...table,
            currentOrder: null,
            status: "empty",
          };
        }
      }

      return table;
    });

    res.json({
      success: true,
      data: processedTables,
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
    const existingTable = await (Table as any).findOne({ number });
    if (existingTable) {
      return res.status(400).json({
        success: false,
        error: "Ийм дугаартай ширээ аль хэдийн байна",
      });
    }

    // Generate QR code URL
    const qrCode = `${
      process.env["FRONTEND_URL"] || "http://localhost:3000"
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

    const table = await (Table as any)
      .findByIdAndUpdate(tableId, { status }, { new: true })
      .populate({
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

    const table = await (Table as any).findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        error: "Table not found",
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

// PATCH /api/tables/:id/clear-order - Clear table's currentOrder
export const clearTableOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const table = await (Table as any)
      .findByIdAndUpdate(
        id,
        {
          status: "empty",
          currentOrder: null,
        },
        {
          new: true,
          runValidators: true,
        }
      )
      .populate({
        path: "currentOrder",
        populate: {
          path: "items.menuItem",
          select: "name nameEn nameMn nameJp price",
        },
      });

    if (!table) {
      return res.status(404).json({
        success: false,
        error: "Table not found",
      });
    }

    res.json({
      success: true,
      message: "Ширээний захиалга амжилттай цэвэрлэгдлээ",
      data: table,
    });
  } catch (error) {
    console.error("Error clearing table order:", error);
    res.status(500).json({
      success: false,
      error: "Ширээний захиалга цэвэрлэхэд алдаа гарлаа",
    });
  }
};

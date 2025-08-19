import { Request, Response } from "express";
import Reservation from "../models/model.reservation.js";

// GET /api/reservations - Get all reservations
export const getAllReservations = async (req: Request, res: Response) => {
  try {
    const { date, status } = req.query;
    const query: any = {};

    // Only apply date filter if a specific date is requested
    if (date && date !== "all") {
      query.date = date as string; // Direct string comparison
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const reservations = await (Reservation as any)
      .find(query)
      .populate("table", "number")
      .sort({ date: 1, time: 1 })
      .lean();

    res.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch reservations" });
  }
};

// POST /api/reservations - Create new reservation
export const createReservation = async (req: Request, res: Response) => {
  try {
    console.log("Received reservation data:", req.body);

    // Keep date as string format (YYYY-MM-DD) to avoid timezone issues
    const reservationData = { ...req.body };
    if (typeof reservationData.date === "string") {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(reservationData.date)) {
        return res.status(400).json({
          success: false,
          error: "Invalid date format. Expected YYYY-MM-DD",
        });
      }

      // Keep the date as string - no conversion needed
      console.log("Date kept as string:", reservationData.date);
    }

    // Handle tableId to table mapping
    if (reservationData.tableId) {
      reservationData.table = reservationData.tableId;
      delete reservationData.tableId;
    }

    // Generate unique reservation number
    let reservationNumber;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      attempts++;
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      reservationNumber = `RES-${timestamp}-${random}`;

      // Check if this number already exists
      const existing = await Reservation.exists({ reservationNumber });
      if (!existing) break;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate unique reservation number",
      });
    }

    reservationData.reservationNumber = reservationNumber;

    // Validate required fields
    if (
      !reservationData.customerName ||
      !reservationData.customerPhone ||
      !reservationData.date ||
      !reservationData.time ||
      !reservationData.partySize
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: customerName, customerPhone, date, time, partySize",
      });
    }

    // Check for existing reservations on the same table at the same time
    if (reservationData.table) {
      // Convert time to minutes for easier comparison
      const [hours, minutes] = reservationData.time.split(":").map(Number);
      const requestedTimeMinutes = hours * 60 + minutes;

      // Check for reservations on the same table on the same date
      const existingReservations = await (Reservation as any).find({
        table: reservationData.table,
        date: reservationData.date, // Direct string comparison
        status: { $nin: ["cancelled", "no-show", "completed"] }, // Don't count cancelled/completed reservations
      });

      // Check for conflicts (same time or within 2 hours)
      for (const existing of existingReservations) {
        const [existingHours, existingMinutes] = existing.time
          .split(":")
          .map(Number);
        const existingTimeMinutes = existingHours * 60 + existingMinutes;

        const timeDifference = Math.abs(
          requestedTimeMinutes - existingTimeMinutes
        );

        if (timeDifference < 120) {
          // Less than 2 hours apart
          return res.status(409).json({
            success: false,
            error: `Table already has a reservation at ${existing.time} on ${reservationData.date}. Reservations must be at least 2 hours apart. Please choose a different time or table.`,
          });
        }
      }

      // Check if table has active orders around the same time
      // Import Order model at the top of the file if not already imported
      try {
        const Order = (await import("../models/model.order.js")).default;
        // For order conflict check, we need to convert string date to Date objects
        const [year, month, day] = reservationData.date.split("-").map(Number);
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

        const activeOrders = await Order.find({
          table: reservationData.table,
          status: { $in: ["pending", "preparing", "serving"] },
          createdAt: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        });

        if (activeOrders.length > 0) {
          // Check if reservation time is at least 3 hours after current time
          const now = new Date();
          const [year, month, day] = reservationData.date
            .split("-")
            .map(Number);
          const reservationDateTime = new Date(year, month - 1, day);
          const [hours, minutes] = reservationData.time.split(":").map(Number);
          reservationDateTime.setHours(hours, minutes, 0, 0);

          const timeDifference = reservationDateTime.getTime() - now.getTime();
          const hoursDifference = timeDifference / (1000 * 60 * 60);

          if (hoursDifference < 3) {
            return res.status(409).json({
              success: false,
              error: `Table currently has active orders. Reservations must be at least 3 hours in advance. Please choose a later time or different table.`,
            });
          }

          // If reservation is 3+ hours later, allow it but show a warning
          console.log(
            `Allowing reservation for table with active orders - reservation is ${hoursDifference.toFixed(
              1
            )} hours later`
          );
        }
      } catch (importError) {
        console.log("Order model not available, skipping order conflict check");
      }
    }

    console.log("Processed reservation data:", reservationData);

    const reservation = new Reservation(reservationData);
    await reservation.save();

    console.log("Reservation saved successfully:", reservation);

    res.status(201).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Provide more specific error messages
    if (error instanceof Error && error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation error: " + error.message,
      });
    }

    res
      .status(500)
      .json({ success: false, error: "Failed to create reservation" });
  }
};

// DELETE /api/reservations/:id - Cancel reservation
export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = await (Reservation as any)
      .findByIdAndUpdate(
        id,
        { status: "cancelled" },
        { new: true, runValidators: true }
      )
      .populate("table", "number");

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: "Reservation not found",
      });
    }

    res.json({
      success: true,
      data: reservation,
      message: "Reservation cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel reservation",
    });
  }
};

// PUT /api/reservations/:id - Update a reservation
export const updateReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Keep date as string format (YYYY-MM-DD) to avoid timezone issues
    if (typeof updateData.date === "string") {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(updateData.date)) {
        return res.status(400).json({
          success: false,
          error: "Invalid date format. Expected YYYY-MM-DD",
        });
      }
      console.log("Date kept as string:", updateData.date);
    }

    // Handle tableId to table mapping
    if (updateData.tableId) {
      updateData.table = updateData.tableId;
      delete updateData.tableId;
    }

    // Check if reservation exists
    const existingReservation = await (Reservation as any).findById(id);
    if (!existingReservation) {
      return res.status(404).json({
        success: false,
        error: "Reservation not found",
      });
    }

    // Update the reservation
    const updatedReservation = await (Reservation as any)
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("table", "number");

    res.json({
      success: true,
      message: "Reservation updated successfully",
      data: updatedReservation,
    });
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update reservation",
    });
  }
};

// DELETE /api/reservations/:id - Delete reservation (only for seated/cancelled)
export const deleteReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = await (Reservation as any).findById(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: "Reservation not found",
      });
    }

    // Only allow deletion of seated or cancelled reservations
    if (reservation.status !== "seated" && reservation.status !== "cancelled") {
      return res.status(400).json({
        success: false,
        error: "Only seated or cancelled reservations can be deleted",
      });
    }

    // If reservation has a table, update table status back to available
    if (reservation.table) {
      try {
        // Import Table model dynamically to avoid circular dependencies
        const Table = (await import("../models/model.table.js")).default;
        await (Table as any).findByIdAndUpdate(
          reservation.table,
          { status: "empty" },
          { new: true }
        );
      } catch (importError) {
        console.log("Table model not available, skipping table status update");
      }
    }

    await (Reservation as any).findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Reservation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete reservation",
    });
  }
};

// Smart cleanup function for old reservations
export const cleanupOldReservations = async () => {
  try {
    const now = new Date();

    // Keep "completed" reservations for 1 month
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Keep "cancelled" reservations for 1 week
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Keep "no-show" reservations for 1 week
    const noShowCutoff = new Date(now);
    noShowCutoff.setDate(noShowCutoff.getDate() - 7);

    // Delete old completed reservations
    const deletedCompleted = await (Reservation as any).deleteMany({
      status: "completed",
      date: { $lt: oneMonthAgo },
    });

    // Delete old cancelled reservations
    const deletedCancelled = await (Reservation as any).deleteMany({
      status: "cancelled",
      date: { $lt: oneWeekAgo },
    });

    // Delete old no-show reservations
    const deletedNoShow = await (Reservation as any).deleteMany({
      status: "no-show",
      date: { $lt: noShowCutoff },
    });

    console.log(
      `Cleanup completed: ${deletedCompleted.deletedCount} completed, ${deletedCancelled.deletedCount} cancelled, ${deletedNoShow.deletedCount} no-show reservations removed`
    );

    return {
      success: true,
      deleted: {
        completed: deletedCompleted.deletedCount,
        cancelled: deletedCancelled.deletedCount,
        noShow: deletedNoShow.deletedCount,
      },
    };
  } catch (error) {
    console.error("Error during cleanup:", error);
    return {
      success: false,
      error: "Cleanup failed",
    };
  }
};

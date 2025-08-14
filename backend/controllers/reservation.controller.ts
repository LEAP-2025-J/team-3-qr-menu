import { Request, Response } from "express";
import Reservation from "../models/model.reservation.js";

// GET /api/reservations - Get all reservations
export const getAllReservations = async (req: Request, res: Response) => {
  try {
    const { date, status } = req.query;
    const query: any = {};

    // Only apply date filter if a specific date is requested
    if (date && date !== 'all') {
      const startDate = new Date(date as string);
      const endDate = new Date(date as string);
      endDate.setDate(endDate.getDate() + 1);

      query.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
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
    
    // Convert date string to Date object if it's a string
    const reservationData = { ...req.body };
    if (typeof reservationData.date === 'string') {
      reservationData.date = new Date(reservationData.date);
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
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      reservationNumber = `RES-${timestamp}-${random}`;
      
      // Check if this number already exists
      const existing = await Reservation.exists({ reservationNumber });
      if (!existing) break;
    } while (attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate unique reservation number"
      });
    }
    
    reservationData.reservationNumber = reservationNumber;
    
    // Validate required fields
    if (!reservationData.customerName || !reservationData.customerPhone || !reservationData.date || !reservationData.time || !reservationData.partySize) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: customerName, customerPhone, date, time, partySize"
      });
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
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Provide more specific error messages
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Validation error: " + error.message
      });
    }
    
    res
      .status(500)
      .json({ success: false, error: "Failed to create reservation" });
  }
};

// PATCH /api/reservations/:id - Update reservation status
export const updateReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("table", "number");

    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
        error: "Reservation not found" 
      });
    }

    res.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to update reservation" 
    });
  }
};

// DELETE /api/reservations/:id - Cancel reservation
export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true, runValidators: true }
    ).populate("table", "number");

    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
        error: "Reservation not found" 
      });
    }

    res.json({
      success: true,
      data: reservation,
      message: "Reservation cancelled successfully"
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to cancel reservation" 
    });
  }
};

// DELETE /api/reservations/:id - Delete reservation (only for seated/cancelled)
export const deleteReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
        error: "Reservation not found" 
      });
    }

    // Only allow deletion of seated or cancelled reservations
    if (reservation.status !== "seated" && reservation.status !== "cancelled") {
      return res.status(400).json({ 
        success: false, 
        error: "Only seated or cancelled reservations can be deleted" 
      });
    }

    // If reservation has a table, update table status back to available
    if (reservation.table) {
      // Note: You'll need to implement table status update here
      // This depends on your table management system
    }

    await Reservation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Reservation deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete reservation" 
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
    const deletedCompleted = await Reservation.deleteMany({
      status: "completed",
      date: { $lt: oneMonthAgo }
    });
    
    // Delete old cancelled reservations
    const deletedCancelled = await Reservation.deleteMany({
      status: "cancelled",
      date: { $lt: oneWeekAgo }
    });
    
    // Delete old no-show reservations
    const deletedNoShow = await Reservation.deleteMany({
      status: "no-show",
      date: { $lt: noShowCutoff }
    });
    
    console.log(`Cleanup completed: ${deletedCompleted.deletedCount} completed, ${deletedCancelled.deletedCount} cancelled, ${deletedNoShow.deletedCount} no-show reservations removed`);
    
    return {
      success: true,
      deleted: {
        completed: deletedCompleted.deletedCount,
        cancelled: deletedCancelled.deletedCount,
        noShow: deletedNoShow.deletedCount
      }
    };
  } catch (error) {
    console.error("Error during cleanup:", error);
    return {
      success: false,
      error: "Cleanup failed"
    };
  }
};

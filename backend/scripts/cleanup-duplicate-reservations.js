import mongoose from "mongoose";
import dotenv from "dotenv";
import Reservation from "../models/model.reservation.ts";

dotenv.config();

// Fallback to default MongoDB URI if .env doesn't exist
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI =
    "mongodb+srv://togtoh:Random011021@cluster0.rds2ass.mongodb.net/menu";
}

async function cleanupDuplicateReservations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all reservations
    const allReservations = await Reservation.find({}).populate("table", "number");
    console.log(`Found ${allReservations.length} total reservations`);

    // Group reservations by table, date, and time
    const groupedReservations = {};
    const duplicates = [];

    allReservations.forEach(reservation => {
      if (reservation.table) {
        const key = `${reservation.table._id}-${reservation.date.toDateString()}-${reservation.time}`;
        
        if (!groupedReservations[key]) {
          groupedReservations[key] = [];
        }
        groupedReservations[key].push(reservation);
        
        // If we have more than one reservation for the same table/time, mark as duplicate
        if (groupedReservations[key].length > 1) {
          duplicates.push(...groupedReservations[key]);
        }
      }
    });

    console.log(`Found ${duplicates.length} duplicate reservations`);

    if (duplicates.length > 0) {
      // Keep the first reservation and remove the rest
      const toDelete = [];
      
      Object.values(groupedReservations).forEach(group => {
        if (group.length > 1) {
          // Sort by creation date and keep the oldest
          group.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          // Mark all but the first for deletion
          toDelete.push(...group.slice(1));
        }
      });

      console.log(`Will delete ${toDelete.length} duplicate reservations`);

      // Delete duplicates
      for (const duplicate of toDelete) {
        await Reservation.findByIdAndDelete(duplicate._id);
        console.log(`Deleted duplicate reservation: ${duplicate.reservationNumber} for Table ${duplicate.table.number}`);
      }

      console.log("Duplicate cleanup completed");
    } else {
      console.log("No duplicates found");
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  }
}

cleanupDuplicateReservations(); 
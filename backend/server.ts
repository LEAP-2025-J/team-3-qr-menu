import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Import models (to register schemas with Mongoose)
import "./models/model.category";
import "./models/model.menuItem";
import "./models/model.order";
import "./models/model.table";
import "./models/model.reservation";
import "./models/model.restaurant";

// Import routes
import menuRoutes from "./routes/route.menu";
import orderRoutes from "./routes/route.orders";
import tableRoutes from "./routes/route.tables";
import reservationRoutes from "./routes/route.reservations";
import categoryRoutes from "./routes/route.categories";
import restaurantRoutes from "./routes/route.restaurant";

// Import cleanup function
import { cleanupOldReservations } from "./controllers/reservation.controller.js";

dotenv.config();

const app = express();
const PORT = process.env["PORT"] || 5000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env["FRONTEND_URL"] || "http://192.168.20.179:3000",
      "http://192.168.20.179:3000",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (нэмэгдүүлсэн)
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose
  .connect(process.env["MONGODB_URI"]!)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err: any) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/restaurant", restaurantRoutes);

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
    ...(process.env["NODE_ENV"] === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Server accessible at: http://0.0.0.0:${PORT}`);
  console.log(
    `📱 Frontend URL: ${process.env["FRONTEND_URL"] || "http://localhost:3000"}`
  );

  // Schedule automatic cleanup every day at 2 AM
  const scheduleCleanup = () => {
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(2, 0, 0, 0); // 2 AM

    // If it's already past 2 AM today, schedule for tomorrow
    if (now.getHours() >= 2) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const timeUntilNextRun = nextRun.getTime() - now.getTime();

    setTimeout(async () => {
      console.log("🧹 Starting automatic reservation cleanup...");
      const result = await cleanupOldReservations();
      if (result.success) {
        console.log(
          `✅ Cleanup completed: ${result.deleted.completed} completed, ${result.deleted.cancelled} cancelled, ${result.deleted.noShow} no-show reservations removed`
        );
      } else {
        console.log("❌ Cleanup failed:", result.error);
      }

      // Schedule next cleanup (every 24 hours)
      setInterval(async () => {
        console.log("🧹 Starting automatic reservation cleanup...");
        const result = await cleanupOldReservations();
        if (result.success) {
          console.log(
            `✅ Cleanup completed: ${result.deleted.completed} completed, ${result.deleted.cancelled} cancelled, ${result.deleted.noShow} no-show reservations removed`
          );
        } else {
          console.log("❌ Cleanup failed:", result.error);
        }
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, timeUntilNextRun);

    console.log(`🧹 Next cleanup scheduled for: ${nextRun.toLocaleString()}`);
  };

  scheduleCleanup();
});

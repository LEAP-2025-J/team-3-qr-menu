import express, { Request, Response, NextFunction } from "express"
import mongoose from "mongoose"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"

// Import models (to register schemas with Mongoose)
import "./models/model.category"
import "./models/model.menuItem"
import "./models/model.order"
import "./models/model.table"
import "./models/model.reservation"

// Import routes
import menuRoutes from "./routes/route.menu"
import orderRoutes from "./routes/route.orders"
import tableRoutes from "./routes/route.tables"
import reservationRoutes from "./routes/route.reservations"

dotenv.config()

const app = express()
const PORT = process.env['PORT'] || 5000

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env['FRONTEND_URL'] || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use("/api/", limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Database connection
mongoose
  .connect(process.env['MONGODB_URI']!)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err: any) => console.error("❌ MongoDB connection error:", err))

// Routes
app.use("/api/menu", menuRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/tables", tableRoutes)
app.use("/api/reservations", reservationRoutes)

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
    ...(process.env['NODE_ENV'] === "development" && { stack: err.stack }),
  })
})

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Frontend URL: ${process.env['FRONTEND_URL'] || "http://localhost:3000"}`)
})

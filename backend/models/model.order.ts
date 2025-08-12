import mongoose, { Document, Schema } from "mongoose"

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId
  quantity: number
  price: number
  specialInstructions?: string
}

export interface IOrder extends Document {
  orderNumber: string
  table: mongoose.Types.ObjectId
  items: IOrderItem[]
  subtotal: number
  tax: number
  total: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "served" | "completed" | "cancelled"
  customerName?: string
  customerPhone?: string
  specialRequests?: string
  estimatedTime?: number
  actualTime?: number
  paymentStatus: "pending" | "paid" | "failed"
  paymentMethod?: "cash" | "card" | "mobile"
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  menuItem: {
    type: Schema.Types.ObjectId,
    ref: "MenuItem",
    required: [true, "Menu item is required"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be positive"],
  },
  specialInstructions: {
    type: String,
    trim: true,
  },
})

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
    },
    table: {
      type: Schema.Types.ObjectId,
      ref: "Table",
      required: [true, "Table is required"],
    },
    items: {
      type: [OrderItemSchema],
      required: [true, "Order items are required"],
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must have at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal must be positive"],
    },
    tax: {
      type: Number,
      required: [true, "Tax is required"],
      min: [0, "Tax must be positive"],
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total must be positive"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "served", "completed", "cancelled"],
      default: "pending",
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    estimatedTime: {
      type: Number,
      min: [0, "Estimated time must be positive"],
    },
    actualTime: {
      type: Number,
      min: [0, "Actual time must be positive"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "mobile"],
    },
  },
  {
    timestamps: true,
  },
)

// Generate order number before saving
OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await (mongoose.models as any)["Order"].countDocuments()
    this.orderNumber = `ORD-${String(count + 1).padStart(4, "0")}`
  }
  next()
})

// Indexes for better query performance
OrderSchema.index({ table: 1, status: 1 })
OrderSchema.index({ orderNumber: 1 })
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ status: 1 })

export default mongoose.model<IOrder>("Order", OrderSchema) 
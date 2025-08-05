const mongoose = require("mongoose")

const TableSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: [true, "Table number is required"],
      unique: true,
      min: [1, "Table number must be positive"],
    },
    capacity: {
      type: Number,
      required: [true, "Table capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "cleaning", "maintenance"],
      default: "available",
    },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    qrCode: {
      type: String,
      required: [true, "QR code is required"],
      unique: true,
    },
    location: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.models.Table || mongoose.model("Table", TableSchema) 
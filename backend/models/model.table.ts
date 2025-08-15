import mongoose, { Document, Schema } from "mongoose";

export interface ITable extends Document {
  number: number;
  capacity: number;
  status: "empty" | "reserved" | "cleaning" | "maintenance";
  currentOrder?: mongoose.Types.ObjectId;
  qrCode: string;
  location?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
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
      enum: ["empty", "reserved", "cleaning", "maintenance"],
      default: "empty",
    },
    currentOrder: {
      type: Schema.Types.ObjectId,
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
  }
);

export default mongoose.models["Table"] ||
  mongoose.model<ITable>("Table", TableSchema);

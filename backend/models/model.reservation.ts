import mongoose, { type Document, Schema } from "mongoose";

export interface IReservation extends Document {
  reservationNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  partySize: number;
  table?: mongoose.Types.ObjectId;
  status:
    | "pending"
    | "confirmed"
    | "seated"
    | "completed"
    | "cancelled"
    | "no-show";
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>(
  {
    reservationNumber: {
      type: String,
      required: [true, "Reservation number is required"],
      unique: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    date: {
      type: String,
      required: [true, "Reservation date is required"],
      validate: {
        validator: function (v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: "Date must be in YYYY-MM-DD format",
      },
    },
    time: {
      type: String,
      required: [true, "Reservation time is required"],
    },
    partySize: {
      type: Number,
      required: [true, "Party size is required"],
      min: [1, "Party size must be at least 1"],
    },
    table: {
      type: Schema.Types.ObjectId,
      ref: "Table",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "seated",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "pending",
    },
    specialRequests: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate reservation number before saving
// Removed pre-save hook to simplify the model

// Index for better query performance
ReservationSchema.index({ date: 1, time: 1 });
ReservationSchema.index({ customerPhone: 1 });
ReservationSchema.index({ status: 1 });
export default mongoose.models.Reservation ||
  mongoose.model<IReservation>("Reservation", ReservationSchema);

import mongoose, { Document, Schema } from "mongoose"

export interface IOperatingHours {
  day: string
  openTime: string
  closeTime: string
  isOpen: boolean
}

export interface IRestaurant extends Document {
  name: string
  nameEn: string
  nameMn: string
  address: string
  addressEn: string
  addressMn: string
  description: string
  descriptionEn: string
  descriptionMn: string
  phone: string
  email?: string
  website?: string
  operatingHours: IOperatingHours[]
  taxRate: number
  currency: string
  timezone: string
  createdAt: Date
  updatedAt: Date
}

const OperatingHoursSchema = new Schema<IOperatingHours>({
  day: {
    type: String,
    required: true,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  },
  openTime: {
    type: String,
    required: true
  },
  closeTime: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: true
  }
})

const RestaurantSchema = new Schema<IRestaurant>({
  name: {
    type: String,
    required: [true, "Restaurant name is required"],
    trim: true
  },
  nameEn: {
    type: String,
    required: [true, "English name is required"],
    trim: true
  },
  nameMn: {
    type: String,
    required: [true, "Mongolian name is required"],
    trim: true
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true
  },
  addressEn: {
    type: String,
    required: [true, "English address is required"],
    trim: true
  },
  addressMn: {
    type: String,
    required: [true, "Mongolian address is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true
  },
  descriptionEn: {
    type: String,
    required: [true, "English description is required"],
    trim: true
  },
  descriptionMn: {
    type: String,
    required: [true, "Mongolian description is required"],
    trim: true
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  },
  operatingHours: {
    type: [OperatingHoursSchema],
    default: [
      { day: "Monday", openTime: "11:00", closeTime: "22:00", isOpen: true },
      { day: "Tuesday", openTime: "11:00", closeTime: "22:00", isOpen: true },
      { day: "Wednesday", openTime: "11:00", closeTime: "22:00", isOpen: true },
      { day: "Thursday", openTime: "11:00", closeTime: "22:00", isOpen: true },
      { day: "Friday", openTime: "11:00", closeTime: "23:00", isOpen: true },
      { day: "Saturday", openTime: "12:00", closeTime: "23:00", isOpen: true },
      { day: "Sunday", openTime: "12:00", closeTime: "21:00", isOpen: true }
    ]
  },
  taxRate: {
    type: Number,
    default: 10,
    min: [0, "Tax rate must be positive"]
  },
  currency: {
    type: String,
    default: "USD",
    trim: true
  },
  timezone: {
    type: String,
    default: "UTC",
    trim: true
  }
}, {
  timestamps: true
})

export default mongoose.models["Restaurant"] || 
  mongoose.model<IRestaurant>("Restaurant", RestaurantSchema) 
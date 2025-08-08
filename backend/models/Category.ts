import mongoose, { Document, Schema } from "mongoose"

export interface ICategory extends Document {
  name: string
  nameEn: string
  nameMn: string
  description?: string
  icon?: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    nameEn: {
      type: String,
      required: [true, "English name is required"],
      trim: true,
    },
    nameMn: {
      type: String,
      required: [true, "Mongolian name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
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

// Index for better performance
CategorySchema.index({ name: 1 })
CategorySchema.index({ order: 1 })

export default mongoose.model<ICategory>("Category", CategorySchema) 
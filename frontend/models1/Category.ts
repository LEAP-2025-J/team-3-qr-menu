import mongoose, { type Document, Schema } from "mongoose"

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

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema)

import mongoose, { type Document, Schema } from "mongoose"

export interface IMenuItem extends Document {
  name: string
  nameEn: string
  nameMn: string
  description: string
  descriptionEn: string
  descriptionMn: string
  price: number
  category: mongoose.Types.ObjectId
  image?: string
  ingredients: string[]
  allergens: string[]
  isSpicy: boolean
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isAvailable: boolean
  preparationTime: number // minutes
  calories?: number
  order: number
  createdAt: Date
  updatedAt: Date
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: [true, "Menu item name is required"],
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
      required: [true, "Description is required"],
      trim: true,
    },
    descriptionEn: {
      type: String,
      required: [true, "English description is required"],
      trim: true,
    },
    descriptionMn: {
      type: String,
      required: [true, "Mongolian description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    image: {
      type: String,
      trim: true,
    },
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    allergens: [
      {
        type: String,
        enum: ["gluten", "dairy", "eggs", "fish", "shellfish", "nuts", "peanuts", "soy", "sesame"],
        trim: true,
      },
    ],
    isSpicy: {
      type: Boolean,
      default: false,
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    isGlutenFree: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      required: [true, "Preparation time is required"],
      min: [1, "Preparation time must be at least 1 minute"],
    },
    calories: {
      type: Number,
      min: [0, "Calories must be positive"],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
MenuItemSchema.index({ category: 1, isAvailable: 1 })
MenuItemSchema.index({ name: "text", description: "text" })

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema)

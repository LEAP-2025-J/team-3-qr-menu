import mongoose, { Document, Schema } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  nameEn: string;
  nameMn: string;
  nameJp: string;
  description: string;
  descriptionEn: string;
  descriptionMn: string;
  descriptionJp: string;
  price: number;
  category: mongoose.Types.ObjectId;
  image?: string;
  imagePublicId?: string;
  ingredients: string[];
  isAvailable: boolean;
  preparationTime: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
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
    nameJp: {
      type: String,
      required: [true, "Japanese name is required"],
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
    descriptionJp: {
      type: String,
      required: [true, "Japanese description is required"],
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
    imagePublicId: {
      type: String,
      trim: true,
    },
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      required: [true, "Preparation time is required"],
      min: [1, "Preparation time must be at least 1 minute"],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
MenuItemSchema.index({ category: 1, isAvailable: 1 });
MenuItemSchema.index({ name: "text", description: "text" });
MenuItemSchema.index({ order: 1 });

export default mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);

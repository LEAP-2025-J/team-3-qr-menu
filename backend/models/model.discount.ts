import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    // Хөнгөлөлтийн хувь (1-100%)
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 1,
    },
    // Хөнгөлөлттэй үнэ дуусах цаг (HH:MM формат)
    discountEndTime: {
      type: String,
      required: true,
      default: "19:00",
      validate: {
        validator: function (v: string) {
          // HH:MM формат шалгах
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "Цаг нь HH:MM форматтай байх ёстой",
      },
    },
    // Хөнгөлөлт идэвхтэй эсэх
    isActive: {
      type: Boolean,
      default: true,
    },
    // Хөнгөлөлтийн тайлбар
    description: {
      type: String,
      default: "Хөгжөөний цаг! 19:00 цагийн өмнөх бүх бараанд 1% хөнгөлөлт",
    },
  },
  {
    timestamps: true,
  }
);

export const Discount = mongoose.model("Discount", discountSchema);

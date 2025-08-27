import { Request, Response } from "express";
import { Discount } from "../models/model.discount.js";

// Хөнгөлөлтийн тохиргоог авах
export const getDiscountSettings = async (req: Request, res: Response) => {
  try {
    // Хамгийн сүүлийн идэвхтэй хөнгөлөлтийн тохиргоог авах
    const discount = await Discount.findOne({ isActive: true }).sort({ createdAt: -1 });
    
    if (!discount) {
      // Хэрэв тохиргоо байхгүй бол default утга буцаах
      return res.json({
        success: true,
        data: {
          discountPercentage: 1,
          discountEndTime: "19:00",
          isActive: true,
          description: "Хөгжөөний цаг! 19:00 цагийн өмнөх бүх бараанд 1% хөнгөлөлт"
        }
      });
    }

    res.json({
      success: true,
      data: discount
    });
  } catch (error) {
    console.error("Хөнгөлөлтийн тохиргоо авахад алдаа:", error);
    res.status(500).json({
      success: false,
      error: "Хөнгөлөлтийн тохиргоо авахад алдаа гарлаа"
    });
  }
};

// Хөнгөлөлтийн тохиргоог шинэчлэх
export const updateDiscountSettings = async (req: Request, res: Response) => {
  try {
    const { discountPercentage, discountEndTime, isActive, description } = req.body;

    // Validation
    if (discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({
        success: false,
        error: "Хөнгөлөлтийн хувь 0-100% хооронд байх ёстой"
      });
    }

    if (!discountEndTime || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(discountEndTime)) {
      return res.status(400).json({
        success: false,
        error: "Цаг нь HH:MM форматтай байх ёстой"
      });
    }

    // Хуучин идэвхтэй тохиргоог идэвхгүй болгох
    await Discount.updateMany(
      { isActive: true },
      { isActive: false }
    );

    // Шинэ тохиргоо үүсгэх
    const newDiscount = new Discount({
      discountPercentage,
      discountEndTime,
      isActive: isActive !== false, // default true
      description: description || `Хөгжөөний цаг! ${discountEndTime} цагийн өмнөх бүх бараанд ${discountPercentage}% хөнгөлөлт`
    });

    await newDiscount.save();

    res.json({
      success: true,
      data: newDiscount,
      message: "Хөнгөлөлтийн тохиргоо амжилттай шинэчлэгдлээ"
    });
  } catch (error) {
    console.error("Хөнгөлөлтийн тохиргоо шинэчлэхэд алдаа:", error);
    res.status(500).json({
      success: false,
      error: "Хөнгөлөлтийн тохиргоо шинэчлэхэд алдаа гарлаа"
    });
  }
};

// Хөнгөлөлтийн тохиргооны түүхийг авах
export const getDiscountHistory = async (req: Request, res: Response) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 }).limit(10);
    
    res.json({
      success: true,
      data: discounts
    });
  } catch (error) {
    console.error("Хөнгөлөлтийн түүх авахад алдаа:", error);
    res.status(500).json({
      success: false,
      error: "Хөнгөлөлтийн түүх авахад алдаа гарлаа"
    });
  }
};

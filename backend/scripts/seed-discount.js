import mongoose from "mongoose";
import dotenv from "dotenv";
import { Discount } from "../dist/models/model.discount.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seedDiscount() {
  try {
    // MongoDB холболт
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB холбогдлоо");

    // Хуучин хөнгөлөлтийн тохиргоог устгах
    await Discount.deleteMany({});
    console.log("Хуучин хөнгөлөлтийн тохиргоонууд устгагдлаа");

    // Default хөнгөлөлтийн тохиргоо үүсгэх
    const defaultDiscount = new Discount({
      discountPercentage: 1,
      discountEndTime: "19:00",
      isActive: true,
      description: "Хөгжөөний цаг! 19:00 цагийн өмнөх бүх бараанд 1% хөнгөлөлт"
    });

    await defaultDiscount.save();
    console.log("Default хөнгөлөлтийн тохиргоо үүсгэгдлээ:", defaultDiscount);

    console.log("✅ Хөнгөлөлтийн тохиргоо амжилттай үүсгэгдлээ!");
  } catch (error) {
    console.error("❌ Алдаа:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB холболт тасарлаа");
  }
}

seedDiscount();

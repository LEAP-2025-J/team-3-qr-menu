/**
 * Хуучин захиалгуудад business day field нэмэх migration script
 * Business day: 09:00-04:00 (маргааш) = 1 business day
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../models/model.order.js";

// Environment variables ачаалах
dotenv.config();

/**
 * Тухайн цагийг business day болгон хөрвүүлэх
 * @param date - Хөрвүүлэх огноо
 * @returns Business day огноо (09:00 цагтай)
 */
function getBusinessDay(date: Date): Date {
  const utc8Date = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" })
  );
  const currentHour = utc8Date.getHours();

  // Хэрэв 04:00-09:00 хооронд бол өмнөх өдөр
  if (currentHour >= 0 && currentHour < 9) {
    const previousDay = new Date(utc8Date);
    previousDay.setDate(previousDay.getDate() - 1);
    previousDay.setHours(9, 0, 0, 0);
    return previousDay;
  }

  // Хэрэв 09:00-24:00 хооронд бол өнөөдөр
  const businessDay = new Date(utc8Date);
  businessDay.setHours(9, 0, 0, 0);
  return businessDay;
}

/**
 * Тухайн цагийг business day string болгон хөрвүүлэх
 * @param date - Хөрвүүлэх огноо
 * @returns Business day string (YYYY-MM-DD)
 */
function getBusinessDayString(date: Date): string {
  const businessDay = getBusinessDay(date);
  return businessDay.toISOString().split("T")[0];
}

/**
 * Migration үндсэн функц
 */
async function migrateBusinessDay() {
  try {
    console.log("🚀 Business day migration эхэллээ...");

    // MongoDB холболт
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable олдсонгүй");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB холбогдсон");

    // Business day field байхгүй захиалгуудыг олох
    const ordersWithoutBusinessDay = await Order.find({
      $or: [
        { businessDay: { $exists: false } },
        { businessDay: null },
        { businessDay: "" },
      ],
    });

    console.log(`📊 Business day field байхгүй захиалгын тоо: ${ordersWithoutBusinessDay.length}`);

    if (ordersWithoutBusinessDay.length === 0) {
      console.log("✅ Бүх захиалгад business day field байна");
      return;
    }

    // Захиалга бүрт business day тооцоолж нэмэх
    let updatedCount = 0;
    let errorCount = 0;

    for (const order of ordersWithoutBusinessDay) {
      try {
        const businessDay = getBusinessDayString(order.createdAt);
        
        await Order.findByIdAndUpdate(order._id, {
          $set: { businessDay },
        });

        updatedCount++;
        
        if (updatedCount % 100 === 0) {
          console.log(`📈 ${updatedCount} захиалга шинэчлэгдлээ...`);
        }
      } catch (error) {
        console.error(`❌ Захиалга ${order._id} шинэчлэхэд алдаа:`, error);
        errorCount++;
      }
    }

    console.log("🎉 Migration дууслаа!");
    console.log(`✅ Амжилттай шинэчлэгдсэн: ${updatedCount}`);
    console.log(`❌ Алдаа гарсан: ${errorCount}`);

    // Шалгалт - business day field байхгүй захиалга үлдсэн эсэх
    const remainingOrders = await Order.find({
      $or: [
        { businessDay: { $exists: false } },
        { businessDay: null },
        { businessDay: "" },
      ],
    });

    if (remainingOrders.length > 0) {
      console.log(`⚠️  ${remainingOrders.length} захиалга business day field байхгүй хэвээр байна`);
    } else {
      console.log("✅ Бүх захиалгад business day field нэмэгдлээ");
    }

  } catch (error) {
    console.error("💥 Migration алдаа:", error);
  } finally {
    // MongoDB холболт хаах
    await mongoose.disconnect();
    console.log("🔌 MongoDB холболт хаагдлаа");
  }
}

// Script ажиллуулах
migrateBusinessDay()
  .then(() => {
    console.log("✅ Migration амжилттай дууслаа");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration алдаа:", error);
    process.exit(1);
  });

export default migrateBusinessDay;

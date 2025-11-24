/**
 * 00:00-06:30 хооронд үүссэн захиалгуудыг аюулгүйгээр устгах script
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
// Import compiled models from dist folder
import Order from "../dist/models/model.order.js";
import Table from "../dist/models/model.table.js";

// Environment variables ачаалах
dotenv.config();

/**
 * 00:00-06:30 хооронд үүссэн захиалгуудыг олох
 */
async function findEarlyOrders() {
  try {
    console.log("🔍 00:00-06:30 хооронд үүссэн захиалгуудыг хайж байна...");

    // Өнөөдрийн 00:00-06:30 range тооцоолох
    const now = new Date();
    const utc8Date = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    // Өнөөдрийн 00:00
    const todayStart = new Date(utc8Date);
    todayStart.setHours(0, 0, 0, 0);
    const todayStartUTC = new Date(todayStart.getTime() - 8 * 60 * 60 * 1000);

    // Өнөөдрийн 06:30
    const cutoffTime = new Date(utc8Date);
    cutoffTime.setHours(6, 30, 0, 0);
    const cutoffTimeUTC = new Date(cutoffTime.getTime() - 8 * 60 * 60 * 1000);

    console.log(
      `📅 Хайх хугацаа: ${todayStartUTC.toISOString()} - ${cutoffTimeUTC.toISOString()}`
    );

    // 00:00-06:30 хооронд үүссэн захиалгуудыг олох
    const earlyOrders = await Order.find({
      createdAt: {
        $gte: todayStartUTC,
        $lte: cutoffTimeUTC,
      },
    })
      .populate("table", "number")
      .sort({ createdAt: 1 });

    console.log(`📊 Олдсон захиалгын тоо: ${earlyOrders.length}`);

    if (earlyOrders.length > 0) {
      console.log("\n📋 Олдсон захиалгууд:");
      earlyOrders.forEach((order, index) => {
        console.log(
          `${index + 1}. ${order.orderNumber} - Ширээ ${
            order.table?.number || "?"
          } - ${order.createdAt.toISOString()} - ${order.status} - ${
            order.total
          }₮`
        );
      });
    }

    return earlyOrders;
  } catch (error) {
    console.error("❌ Захиалга хайхад алдаа:", error);
    return [];
  }
}

/**
 * Захиалгуудыг аюулгүйгээр устгах
 */
async function deleteEarlyOrders(orders, confirm = false) {
  if (!confirm) {
    console.log(
      "\n⚠️  Захиалгуудыг устгахын тулд confirm=true параметр өгнө үү."
    );
    return;
  }

  if (orders.length === 0) {
    console.log("✅ Устгах захиалга байхгүй.");
    return;
  }

  console.log(`\n🗑️  ${orders.length} захиалгыг устгаж байна...`);

  let deletedCount = 0;
  let errorCount = 0;

  for (const order of orders) {
    try {
      // Ширээний currentOrder болон orders array-аас хасах
      if (order.table) {
        await Table.findByIdAndUpdate(order.table._id, {
          $pull: { orders: order._id },
          $unset: { currentOrder: order._id },
        });

        // Хэрэв энэ захиалга currentOrder байсан бол ширээг хоосон болгох
        const table = await Table.findById(order.table._id);
        if (table && (!table.orders || table.orders.length === 0)) {
          await Table.findByIdAndUpdate(order.table._id, {
            status: "empty",
            currentOrder: null,
          });
        }
      }

      // Захиалгыг устгах
      await Order.findByIdAndDelete(order._id);

      console.log(`✅ Устгагдсан: ${order.orderNumber}`);
      deletedCount++;
    } catch (error) {
      console.error(`❌ ${order.orderNumber} устгахад алдаа:`, error);
      errorCount++;
    }
  }

  console.log(`\n🎉 Дууслаа!`);
  console.log(`✅ Амжилттай устгагдсан: ${deletedCount}`);
  console.log(`❌ Алдаа гарсан: ${errorCount}`);
}

/**
 * Main функц
 */
async function main() {
  try {
    console.log("🚀 Early Orders Cleanup Script эхэллээ...");

    // MongoDB холболт
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable олдсонгүй");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB холбогдсон");

    // Захиалгуудыг олох
    const earlyOrders = await findEarlyOrders();

    if (earlyOrders.length === 0) {
      console.log("✅ 00:00-06:30 хооронд үүссэн захиалга байхгүй.");
    } else {
      console.log("\n❓ Эдгээр захиалгуудыг устгахыг хүсэж байна уу?");
      console.log("   Script дахин ажиллуулж --confirm параметр өгнө үү:");
      console.log("   node cleanup-early-orders.js --confirm");

      // Command line argument шалгах
      const shouldConfirm = process.argv.includes("--confirm");

      if (shouldConfirm) {
        await deleteEarlyOrders(earlyOrders, true);
      }
    }
  } catch (error) {
    console.error("💥 Script алдаа:", error);
  } finally {
    // MongoDB холболт хаах
    await mongoose.disconnect();
    console.log("🔌 MongoDB холболт хаагдлаа");
  }
}

// Script ажиллуулах
main()
  .then(() => {
    console.log("✅ Script амжилттай дууслаа");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script алдаа:", error);
    process.exit(1);
  });

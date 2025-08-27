import mongoose from "mongoose";
import Order from "../models/model.order.js";

// MongoDB холболт
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/haku-restaurant";

async function migrateOrderSource() {
  try {
    console.log("🔗 MongoDB-тэй холбогдож байна...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB-тэй холбогдлоо");

    // orderSource field байхгүй захиалгуудыг олох
    const ordersWithoutSource = await Order.find({
      orderSource: { $exists: false }
    });

    console.log(`📊 orderSource field байхгүй захиалга: ${ordersWithoutSource.length}`);

    if (ordersWithoutSource.length === 0) {
      console.log("✅ Бүх захиалгад orderSource field байна");
      return;
    }

    // Хуучин захиалгуудад orderSource нэмэх
    // customerName болон customerPhone хоосон бол админ захиалга, эсвэл QR захиалга
    let updatedCount = 0;
    
    for (const order of ordersWithoutSource) {
      const isAdminOrder = !order.customerName && !order.customerPhone;
      const orderSource = isAdminOrder ? "admin" : "qr";
      
      await Order.findByIdAndUpdate(order._id, {
        $set: { orderSource }
      });
      
      updatedCount++;
      console.log(`✅ Захиалга ${order.orderNumber} - ${orderSource}`);
    }

    console.log(`🎉 Нийт ${updatedCount} захиалга шинэчлэгдлээ`);

  } catch (error) {
    console.error("❌ Алдаа:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB холболт тасарлаа");
  }
}

// Script ажиллуулах
migrateOrderSource();

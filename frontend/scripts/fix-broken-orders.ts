import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { ScriptResult, Order, OrderItem } from "../types/scripts.type.js";

dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env["MONGODB_URI"] as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

async function fixBrokenOrders(): Promise<ScriptResult> {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const ordersCollection = db.collection("orders");
    const menuCollection = db.collection("menuitems");

    console.log("\n🔍 Checking for broken orders...");

    // Get all orders
    const orders = await ordersCollection.find({}).toArray();
    console.log(`📊 Found ${orders.length} orders`);

    let fixedCount = 0;
    let noChangeCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      try {
        let needsUpdate = false;
        const updatedItems: any[] = [];

        // Check each item in the order
        for (const item of order.items || []) {
          if (!item.menuItemId) {
            console.log(
              `⚠️  Order ${order.orderNumber}: Item without menuItemId`
            );
            continue;
          }

          // Try to find the menu item
          const menuItem = await menuCollection.findOne({
            _id: item.menuItemId,
          });

          if (!menuItem) {
            console.log(
              `❌ Order ${order.orderNumber}: Menu item not found for ${item.menuItemId}`
            );
            needsUpdate = true;

            // Remove the broken item
            continue;
          }

          // Update item with current menu data
          const updatedItem = {
            ...item,
            name: menuItem.nameEn,
            price: menuItem.price,
            image: menuItem.image,
          };

          updatedItems.push(updatedItem);
        }

        if (needsUpdate || updatedItems.length !== (order.items?.length || 0)) {
          // Calculate new total
          const newTotal = updatedItems.reduce(
            (sum: number, item: any) => sum + item.price * item.quantity,
            0
          );

          // Update the order
          const result = await ordersCollection.updateOne(
            { _id: order._id },
            {
              $set: {
                items: updatedItems,
                totalAmount: newTotal,
                updatedAt: new Date(),
              },
            }
          );

          if (result.modifiedCount > 0) {
            console.log(
              `✅ Fixed order ${order.orderNumber}: ${
                updatedItems.length
              } items, $${newTotal.toFixed(2)}`
            );
            fixedCount++;
          } else {
            console.log(`ℹ️  No changes needed for order ${order.orderNumber}`);
            noChangeCount++;
          }
        } else {
          console.log(`ℹ️  Order ${order.orderNumber} is already correct`);
          noChangeCount++;
        }
      } catch (error) {
        console.error(
          `❌ Error processing order ${order.orderNumber}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
        errorCount++;
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   ✅ Fixed: ${fixedCount} orders`);
    console.log(`   ℹ️  No changes: ${noChangeCount} orders`);
    console.log(`   ❌ Errors: ${errorCount} orders`);

    return {
      success: true,
      message: `Broken orders fix completed: ${fixedCount} fixed, ${noChangeCount} no changes, ${errorCount} errors`,
      data: {
        fixed: fixedCount,
        noChange: noChangeCount,
        errors: errorCount,
        total: orders.length,
      },
    };
  } catch (error) {
    console.error(
      "❌ Database error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      success: false,
      message: "Broken orders fix failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await client.close();
    console.log("\n🔌 MongoDB connection closed");
  }
}

// Run the script
fixBrokenOrders().then((result) => {
  if (result.success) {
    console.log("🎉 Broken orders fix completed successfully!");
  } else {
    console.error("💥 Broken orders fix failed:", result.error);
    process.exit(1);
  }
});

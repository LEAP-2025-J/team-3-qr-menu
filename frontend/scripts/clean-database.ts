import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { ScriptResult } from "../types/scripts.type.js";

dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env["MONGODB_URI"] as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

async function cleanDatabase(): Promise<ScriptResult> {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const collection = db.collection("menuitems");

    console.log("\n🧹 Cleaning up invalid menu items...");

    // Get all menu items
    const allMenuItems = await collection.find({}).toArray();
    console.log(`📊 Found ${allMenuItems.length} total menu items`);

    // Identify invalid items (single characters or very short names)
    const invalidItems = allMenuItems.filter(
      (item: any) =>
        item.nameEn &&
        (item.nameEn.length <= 2 ||
          /^[a-z]$/i.test(item.nameEn) ||
          item.nameEn.trim() === "")
    );

    if (invalidItems.length > 0) {
      console.log(`\n❌ Found ${invalidItems.length} invalid items to remove:`);
      invalidItems.forEach((item: any) => {
        console.log(`   - "${item.nameEn}" (ID: ${item._id})`);
      });

      // Remove invalid items
      const deleteResult = await collection.deleteMany({
        _id: { $in: invalidItems.map((item: any) => item._id) },
      });

      console.log(`\n🗑️  Removed ${deleteResult.deletedCount} invalid items`);
    } else {
      console.log("\n✅ No invalid items found");
    }

    // Show remaining valid items
    const remainingItems = await collection.find({}).toArray();
    console.log(`\n📋 Remaining valid menu items (${remainingItems.length}):`);
    remainingItems.forEach((item: any) => {
      const hasImage = item.image ? "✅" : "❌";
      console.log(
        `   ${hasImage} ${item.nameEn} - ${
          item.categoryNameEn || "No category"
        }`
      );
    });

    // Check for items without categories
    const itemsWithoutCategory = remainingItems.filter(
      (item: any) => !item.categoryNameEn
    );
    if (itemsWithoutCategory.length > 0) {
      console.log(
        `\n⚠️  Found ${itemsWithoutCategory.length} items without categories:`
      );
      itemsWithoutCategory.forEach((item: any) => {
        console.log(`   - ${item.nameEn}`);
      });
    }

    console.log("\n🎉 Database cleanup completed!");

    return {
      success: true,
      message: `Database cleanup completed: ${invalidItems.length} invalid items removed, ${remainingItems.length} valid items remaining`,
      data: {
        removed: invalidItems.length,
        remaining: remainingItems.length,
        withoutCategory: itemsWithoutCategory.length,
      },
    };
  } catch (error) {
    console.error(
      "❌ Database error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      success: false,
      message: "Database cleanup failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await client.close();
    console.log("\n🔌 MongoDB connection closed");
  }
}

// Run the script
cleanDatabase().then((result) => {
  if (result.success) {
    console.log("🎉 Database cleanup completed successfully!");
  } else {
    console.error("💥 Database cleanup failed:", result.error);
    process.exit(1);
  }
});

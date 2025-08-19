import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { ScriptResult } from "../types/scripts.type.js";

dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env["MONGODB_URI"] as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

async function assignCategories(): Promise<ScriptResult> {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const menuCollection = db.collection("menuitems");
    const categoryCollection = db.collection("categories");

    console.log("\n📋 Checking existing categories...");

    // Get all categories
    const categories = await categoryCollection.find({}).toArray();
    console.log(`📂 Found ${categories.length} categories:`);
    categories.forEach((cat: any) => {
      console.log(`   - ${cat.nameEn} (ID: ${cat._id})`);
    });

    if (categories.length === 0) {
      console.log(
        "\n❌ No categories found. Please run your seed script first to create categories."
      );
      return {
        success: false,
        message: "No categories found. Please run seed script first.",
        error: "No categories available",
      };
    }

    console.log("\n🔍 Assigning categories to menu items...");

    // Define category mapping based on item names
    const categoryMapping: { [key: string]: string } = {
      // Appetizers
      Edamame: "appetizers",
      Gyoza: "appetizers",
      "Agedashi Tofu": "appetizers",
      Takoyaki: "appetizers",

      // Sushi
      "Salmon Nigiri": "sushi",
      "Tuna Sashimi": "sushi",
      "California Roll": "sushi",
      "Spicy Tuna Roll": "sushi",
      "Dragon Roll": "sushi",

      // Main Dishes
      "Teriyaki Chicken": "mains",
      "Beef Sukiyaki": "mains",
      "Tempura Shrimp": "mains",
      "Katsu Curry": "mains",

      // Ramen
      "Tonkotsu Ramen": "ramen",
      "Miso Ramen": "ramen",
      "Spicy Ramen": "ramen",
      "Vegetable Ramen": "ramen",

      // Desserts
      "Mochi Ice Cream": "desserts",
      Mochi: "desserts",
      Dorayaki: "desserts",
      "Matcha Cheesecake": "desserts",
      "Green Tea": "beverages",
    };

    let updatedCount = 0;
    let notFoundCount = 0;
    let noChangeCount = 0;

    for (const [itemName, categoryName] of Object.entries(categoryMapping)) {
      try {
        // Find the category ID
        const category = categories.find(
          (cat: any) => cat.nameEn === categoryName
        );
        if (!category) {
          console.log(
            `⚠️  Category "${categoryName}" not found for ${itemName}`
          );
          continue;
        }

        // Update the menu item
        const result = await menuCollection.updateOne(
          { nameEn: itemName },
          {
            $set: {
              category: category._id,
              categoryNameEn: categoryName,
            },
          }
        );

        if (result.matchedCount > 0) {
          if (result.modifiedCount > 0) {
            console.log(`✅ Updated: ${itemName} → ${categoryName}`);
            updatedCount++;
          } else {
            console.log(`ℹ️  No changes needed: ${itemName}`);
            noChangeCount++;
          }
        } else {
          console.log(`⚠️  Menu item not found: ${itemName}`);
          notFoundCount++;
        }
      } catch (error) {
        console.error(
          `❌ Error updating ${itemName}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    console.log(`\n🎉 Category assignment completed!`);
    console.log(`   ✅ Updated: ${updatedCount} items`);
    console.log(`   ℹ️  No changes: ${noChangeCount} items`);
    console.log(`   ⚠️  Not found: ${notFoundCount} items`);

    // Verify the updates
    const updatedItems = await menuCollection
      .find({ categoryNameEn: { $exists: true } })
      .toArray();
    console.log(`\n📊 Total items with categories: ${updatedItems.length}`);

    return {
      success: true,
      message: `Category assignment completed: ${updatedCount} updated, ${noChangeCount} no changes, ${notFoundCount} not found`,
      data: {
        updated: updatedCount,
        noChange: noChangeCount,
        notFound: notFoundCount,
        totalWithCategories: updatedItems.length,
      },
    };
  } catch (error) {
    console.error(
      "❌ Database error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      success: false,
      message: "Category assignment failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await client.close();
    console.log("\n🔌 MongoDB connection closed");
  }
}

// Run the script
assignCategories().then((result) => {
  if (result.success) {
    console.log("🎉 Category assignment completed successfully!");
  } else {
    console.error("💥 Category assignment failed:", result.error);
    process.exit(1);
  }
});

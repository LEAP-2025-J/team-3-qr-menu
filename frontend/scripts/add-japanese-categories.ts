import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env["MONGODB_URI"] as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

async function addJapaneseCategories() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log("🔌 Connected to MongoDB");
    
    const db = client.db();
    const categoriesCollection = db.collection("categories");

    // Add Japanese names to existing categories
    const updates = [
      {
        nameEn: "Appetizers",
        nameJa: "前菜"
      },
      {
        nameEn: "Sushi", 
        nameJa: "寿司"
      },
      {
        nameEn: "Main Courses",
        nameJa: "メインディッシュ"
      },
      {
        nameEn: "Ramen",
        nameJa: "ラーメン"
      },
      {
        nameEn: "Desserts",
        nameJa: "デザート"
      },
      {
        nameEn: "Beverages",
        nameJa: "ドリンク"
      }
    ];

    console.log("🔄 Starting category updates...");

    for (const update of updates) {
      const result = await categoriesCollection.updateOne(
        { nameEn: update.nameEn },
        { $set: { nameJa: update.nameJa } }
      );
      
      if (result.matchedCount > 0) {
        if (result.modifiedCount > 0) {
          console.log(`✅ Updated ${update.nameEn} → ${update.nameJa}`);
        } else {
          console.log(`ℹ️  ${update.nameEn} already has Japanese name`);
        }
      } else {
        console.log(`⚠️  Category ${update.nameEn} not found`);
      }
    }

    // Verify the updates
    const updatedCategories = await categoriesCollection
      .find({ nameJa: { $exists: true } })
      .toArray();
    
    console.log(`\n📊 Total categories with Japanese names: ${updatedCategories.length}`);
    console.log("🎉 Japanese category names migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("🔌 MongoDB connection closed");
  }
}

addJapaneseCategories(); 
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env["MONGODB_URI"] as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

async function checkCategories() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log("🔌 Connected to MongoDB");
    
    const db = client.db();
    const categoriesCollection = db.collection("categories");

    // Check all categories
    const categories = await categoriesCollection.find({}).toArray();
    
    console.log(`\n📊 Found ${categories.length} categories:`);
    console.log("=" .repeat(50));
    
    categories.forEach((cat, index) => {
      console.log(`\n${index + 1}. Category: ${cat.nameEn || cat.name}`);
      console.log(`   English: ${cat.nameEn || "MISSING"}`);
      console.log(`   Mongolian: ${cat.nameMn || "MISSING"}`);
      console.log(`   Japanese: ${cat.nameJa || "MISSING"}`);
      console.log(`   Order: ${cat.order || "MISSING"}`);
      console.log(`   Active: ${cat.isActive}`);
    });

    // Check for missing Japanese names
    const missingJapanese = categories.filter(cat => !cat.nameJa);
    if (missingJapanese.length > 0) {
      console.log(`\n⚠️  ${missingJapanese.length} categories missing Japanese names:`);
      missingJapanese.forEach(cat => {
        console.log(`   - ${cat.nameEn || cat.name}`);
      });
      console.log("\n💡 Run 'add-japanese-categories.ts' to fix this!");
    } else {
      console.log("\n✅ All categories have Japanese names!");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("\n🔌 MongoDB connection closed");
  }
}

checkCategories(); 
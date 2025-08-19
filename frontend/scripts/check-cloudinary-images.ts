import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { ScriptResult, CloudinaryImage } from "../types/scripts.type.js";

dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env["MONGODB_URI"] as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

async function checkCloudinaryImages(): Promise<ScriptResult> {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const menuCollection = db.collection("menuitems");

    console.log("\n🔍 Checking Cloudinary images...");

    // Get all menu items
    const menuItems = await menuCollection.find({}).toArray();
    console.log(`📊 Found ${menuItems.length} menu items`);

    let validImages = 0;
    let invalidImages = 0;
    let noImages = 0;
    const invalidItems: any[] = [];

    for (const item of menuItems) {
      if (!item.image) {
        console.log(`❌ No image: ${item.nameEn}`);
        noImages++;
        invalidItems.push({ name: item.nameEn, issue: "No image" });
        continue;
      }

      // Check if it's a valid Cloudinary URL
      if (item.image.includes("cloudinary.com")) {
        console.log(`✅ Valid Cloudinary: ${item.nameEn}`);
        validImages++;
      } else {
        console.log(`⚠️  Invalid URL: ${item.nameEn} - ${item.image}`);
        invalidImages++;
        invalidItems.push({
          name: item.nameEn,
          issue: "Invalid URL",
          url: item.image,
        });
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   ✅ Valid Cloudinary images: ${validImages}`);
    console.log(`   ⚠️  Invalid URLs: ${invalidImages}`);
    console.log(`   ❌ No images: ${noImages}`);

    if (invalidItems.length > 0) {
      console.log("\n❌ Items with issues:");
      invalidItems.forEach((item) => {
        console.log(
          `   - ${item.name}: ${item.issue}${item.url ? ` (${item.url})` : ""}`
        );
      });
    }

    return {
      success: true,
      message: `Cloudinary image check completed: ${validImages} valid, ${invalidImages} invalid, ${noImages} missing`,
      data: {
        valid: validImages,
        invalid: invalidImages,
        missing: noImages,
        total: menuItems.length,
        issues: invalidItems,
      },
    };
  } catch (error) {
    console.error(
      "❌ Database error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      success: false,
      message: "Cloudinary image check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await client.close();
    console.log("\n🔌 MongoDB connection closed");
  }
}

// Run the script
checkCloudinaryImages().then((result) => {
  if (result.success) {
    console.log("🎉 Cloudinary image check completed successfully!");
  } else {
    console.error("💥 Cloudinary image check failed:", result.error);
    process.exit(1);
  }
});

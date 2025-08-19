import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { ScriptResult, CloudinaryImage } from "../types/scripts.type.js";

dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env["MONGODB_URI"] as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

async function connectCloudinaryImages(): Promise<ScriptResult> {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const menuCollection = db.collection("menuitems");

    console.log("\n🔍 Connecting Cloudinary images...");

    // Get all menu items
    const menuItems = await menuCollection.find({}).toArray();
    console.log(`📊 Found ${menuItems.length} menu items`);

    let updatedCount = 0;
    let noChangeCount = 0;
    let errorCount = 0;

    for (const item of menuItems) {
      try {
        if (!item.image || !item.image.includes("cloudinary.com")) {
          console.log(`⚠️  Skipping ${item.nameEn}: No valid Cloudinary URL`);
          continue;
        }

        // Extract public_id from Cloudinary URL
        const urlParts = item.image.split("/");
        const publicIdIndex =
          urlParts.findIndex((part) => part === "upload") + 1;

        if (publicIdIndex < urlParts.length) {
          const publicId = urlParts
            .slice(publicIdIndex)
            .join("/")
            .split(".")[0];

          // Update the menu item with Cloudinary metadata
          const result = await menuCollection.updateOne(
            { _id: item._id },
            {
              $set: {
                cloudinaryPublicId: publicId,
                cloudinaryUrl: item.image,
                imageUpdated: new Date(),
              },
            }
          );

          if (result.modifiedCount > 0) {
            console.log(`✅ Updated: ${item.nameEn} (${publicId})`);
            updatedCount++;
          } else {
            console.log(`ℹ️  No changes: ${item.nameEn}`);
            noChangeCount++;
          }
        } else {
          console.log(`⚠️  Could not extract public_id from: ${item.nameEn}`);
          errorCount++;
        }
      } catch (error) {
        console.error(
          `❌ Error processing ${item.nameEn}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
        errorCount++;
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   ✅ Updated: ${updatedCount} items`);
    console.log(`   ℹ️  No changes: ${noChangeCount} items`);
    console.log(`   ❌ Errors: ${errorCount} items`);

    return {
      success: true,
      message: `Cloudinary image connection completed: ${updatedCount} updated, ${noChangeCount} no changes, ${errorCount} errors`,
      data: {
        updated: updatedCount,
        noChange: noChangeCount,
        errors: errorCount,
        total: menuItems.length,
      },
    };
  } catch (error) {
    console.error(
      "❌ Database error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      success: false,
      message: "Cloudinary image connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await client.close();
    console.log("\n🔌 MongoDB connection closed");
  }
}

// Run the script
connectCloudinaryImages().then((result) => {
  if (result.success) {
    console.log("🎉 Cloudinary image connection completed successfully!");
  } else {
    console.error("💥 Cloudinary image connection failed:", result.error);
    process.exit(1);
  }
});

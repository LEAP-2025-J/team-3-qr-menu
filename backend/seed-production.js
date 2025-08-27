import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/model.user.ts";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in environment variables!");
    console.error("Please check your .env.local file");
    process.exit(1);
}

async function seedProductionUsers() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        console.log("URI:", MONGODB_URI.replace(/\/\/.*@/, "//***:***@")); // Hide credentials
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Clear existing users
        await User.deleteMany({});
        console.log("🗑️  Cleared existing users");

        // Hash passwords
        const saltRounds = 10;
        const adminPassword = await bcrypt.hash("admin123", saltRounds);
        const userPassword = await bcrypt.hash("user123", saltRounds);

        // Create admin user
        const adminUser = new User({
            firstName: "Admin",
            lastName: "User",
            photo: "https://res.cloudinary.com/dxlufhjua/image/upload/v1756108503/default-avatar.png",
            registerId: "AD001",
            phoneNumber: "99999999",
            address: "Admin Address",
            username: "admin",
            password: adminPassword,
            role: "admin",
            email: "admin@restaurant.com",
            isActive: true,
        });

        // Create regular user
        const regularUser = new User({
            firstName: "Regular",
            lastName: "User",
            photo: "https://res.cloudinary.com/dxlufhjua/image/upload/v1756108503/default-avatar.png",
            registerId: "US001",
            phoneNumber: "88888888",
            address: "User Address",
            username: "user",
            password: userPassword,
            role: "user",
            email: "user@restaurant.com",
            isActive: true,
        });

        // Save users
        await adminUser.save();
        await regularUser.save();

        console.log("✅ Production users seeded successfully!");
        console.log("👤 Admin user: admin / admin123");
        console.log("👤 Regular user: user / user123");
        console.log("🔐 These credentials will work in production!");

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");

    } catch (error) {
        console.error("❌ Error seeding production users:", error);
        process.exit(1);
    }
}

// Run the seed function
seedProductionUsers();

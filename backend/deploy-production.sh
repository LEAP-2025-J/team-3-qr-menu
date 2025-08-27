#!/bin/bash

echo "🚀 Haku Restaurant Backend Production Deployment Script"
echo "======================================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating production environment file..."
    cat > .env << EOF
# Production Environment Variables
JWT_SECRET=haku-restaurant-super-secure-jwt-secret-key-2024-production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/haku-restaurant
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
PORT=5000
EOF
    echo "✅ Created .env file"
    echo "⚠️  IMPORTANT: Update MONGODB_URI with your real MongoDB connection string!"
    echo "⚠️  IMPORTANT: Update FRONTEND_URL with your real frontend domain!"
fi

# Build the project
echo "🔨 Building backend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Create production seed script
echo "🌱 Creating production seed script..."
cat > seed-production.js << EOF
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./dist/models/model.user.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in environment variables!");
    process.exit(1);
}

async function seedProductionUsers() {
    try {
        console.log("🔌 Connecting to production MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to production MongoDB");

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
        console.log("🔌 Disconnected from production MongoDB");

    } catch (error) {
        console.error("❌ Error seeding production users:", error);
        process.exit(1);
    }
}

// Run the seed function
seedProductionUsers();
EOF

echo "✅ Created production seed script: seed-production.js"

echo ""
echo "🎯 NEXT STEPS FOR PRODUCTION DEPLOYMENT:"
echo "========================================"
echo "1. Update .env file with your real MongoDB URI"
echo "2. Update .env file with your real frontend URL"
echo "3. Deploy to your hosting platform (Vercel, Heroku, etc.)"
echo "4. After deployment, run: node seed-production.js"
echo "5. Your sign-in accounts will work in production!"
echo ""
echo "🔑 Production Login Credentials:"
echo "   Admin: admin / admin123"
echo "   User:  user / user123"
echo ""
echo "🚀 Ready for production deployment!"

import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/model.category.js";
import MenuItem from "../models/model.menuItem.js";
import Table from "../models/model.table.js";

dotenv.config();
// Fallback to default MongoDB URI if .env doesn't exist
if (!process.env["MONGODB_URI"]) {
  process.env["MONGODB_URI"] = "mongodb://localhost:27017/qr-menu";
}

async function seedDatabase() {
  try {
    await mongoose.connect(process.env["MONGODB_URI"]!);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await (Table as any).deleteMany({});
    console.log("Cleared existing data");

    // Seed Categories
    const categories = await Category.insertMany([
      {
        name: "appetizers",
        nameEn: "Appetizers",
        nameMn: "Хоолны өмнөх",
        description: "Start your meal with these delicious appetizers",
        descriptionEn: "Start your meal with these delicious appetizers",
        descriptionMn: "Эдгээр амттай хоолны өмнөх зүйлсээр хоолоо эхлүүлнэ үү",
        icon: "ChefHat",
        order: 1,
      },
      {
        name: "sushi",
        nameEn: "Sushi",
        nameMn: "Суши",
        description: "Fresh sushi and sashimi",
        descriptionEn: "Fresh sushi and sashimi",
        descriptionMn: "Шинэ суши болон сашими",
        icon: "Fish",
        order: 2,
      },
      {
        name: "ramen",
        nameEn: "Ramen",
        nameMn: "Рамен",
        description: "Authentic Japanese ramen bowls",
        descriptionEn: "Authentic Japanese ramen bowls",
        descriptionMn: "Жинхэнэ Япон рамен",
        icon: "Soup",
        order: 3,
      },
      {
        name: "mains",
        nameEn: "Main Courses",
        nameMn: "Үндсэн хоол",
        description: "Traditional Japanese main courses",
        descriptionEn: "Traditional Japanese main courses",
        descriptionMn: "Уламжлалт Япон үндсэн хоолнууд",
        icon: "Beef",
        order: 4,
      },
      {
        name: "desserts",
        nameEn: "Desserts",
        nameMn: "Амттан",
        description: "Sweet endings to your meal",
        descriptionEn: "Sweet endings to your meal",
        descriptionMn: "Хоолны төгсгөлийн чихэрлэг амттан",
        icon: "Coffee",
        order: 5,
      },
      {
        name: "beverages",
        nameEn: "Beverages",
        nameMn: "Ундаа",
        description: "Refreshing drinks and beverages",
        descriptionEn: "Refreshing drinks and beverages",
        descriptionMn: "Сэргээх ундаа болон хүнсний ундаа",
        icon: "Coffee",
        order: 6,
      },
    ]);

    console.log("Seeded categories");

    // Seed Menu Items
    const menuItems = [
      // Appetizers
      {
        name: "Edamame",
        nameEn: "Edamame",
        nameMn: "Эдамаме",
        description: "Steamed young soybeans with sea salt",
        descriptionEn: "Steamed young soybeans with sea salt",
        descriptionMn: "Далайн давстай жигнэсэн залуу шар буурцаг",
        price: 6.5,
        category: categories[0]?._id || "",
        image: "/edamame-beans.png",
        ingredients: ["soybeans", "sea salt"],
        allergens: ["soy"],
        isVegetarian: true,
        isVegan: true,
        preparationTime: 5,
        calories: 120,
        order: 1,
      },
      {
        name: "Gyoza",
        nameEn: "Gyoza",
        nameMn: "Гёоза",
        description: "Pan-fried pork dumplings with ponzu sauce",
        descriptionEn: "Pan-fried pork dumplings with ponzu sauce",
        descriptionMn: "Понзу соустай шарсан гахайн махны бууз",
        price: 8.9,
        category: categories[0]?._id || "",
        image: "/gyoza-dumplings.png",
        ingredients: ["pork", "cabbage", "garlic", "ginger", "ponzu sauce"],
        allergens: ["gluten", "soy"],
        preparationTime: 10,
        calories: 280,
        order: 2,
      },
      // Beverages
      {
        name: "Green Tea",
        nameEn: "Green Tea",
        nameMn: "Ногоон цай",
        description: "Traditional Japanese green tea",
        descriptionEn: "Traditional Japanese green tea",
        descriptionMn: "Уламжлалт Япон ногоон цай",
        price: 3.5,
        category: categories[5]?._id || "",
        image: "/green-tea.png",
        ingredients: ["green tea leaves", "hot water"],
        allergens: [],
        isVegetarian: true,
        isVegan: true,
        preparationTime: 3,
        calories: 0,
        order: 1,
      },
      {
        name: "Coffee",
        nameEn: "Coffee",
        nameMn: "Кофе",
        description: "Fresh brewed coffee",
        descriptionEn: "Fresh brewed coffee",
        descriptionMn: "Шинээр бэлтгэсэн кофе",
        price: 4.0,
        category: categories[5]?._id || "",
        image: "/coffee.png",
        ingredients: ["coffee beans", "hot water"],
        allergens: [],
        isVegetarian: true,
        isVegan: true,
        preparationTime: 5,
        calories: 5,
        order: 2,
      },
    ];

    await MenuItem.insertMany(menuItems);
    console.log("Seeded menu items");

    // Seed Tables
    const tables = [];
    for (let i = 1; i <= 16; i++) {
      tables.push({
        number: i,
        capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6,
        status: "available",
        location: "indoor",
        qrCode: `table-${i}-qr-code`,
      });
    }
    for (let i = 17; i <= 21; i++) {
      tables.push({
        number: i,
        capacity: 4,
        status: "available",
        location: "outdoor",
        qrCode: `table-${i}-qr-code`,
      });
    }

    await (Table as any).insertMany(tables);
    console.log("Seeded tables");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();

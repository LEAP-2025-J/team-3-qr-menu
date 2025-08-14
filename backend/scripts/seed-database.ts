import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/model.category.js";
import MenuItem from "../models/model.menuItem.js";
import Table from "../models/model.table.js";

dotenv.config();
// Fallback to default MongoDB URI if .env doesn't exist
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI =
    "mongodb+srv://togtoh:Random011021@cluster0.rds2ass.mongodb.net/menu";
}

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
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
        nameJp: "枝豆",
        description: "Steamed young soybeans with sea salt",
        descriptionEn: "Steamed young soybeans with sea salt",
        descriptionMn: "Далайн давстай жигнэсэн залуу шар буурцаг",
        descriptionJp: "海塩で蒸した若い枝豆",
        price: 6.5,
        category: categories[0]._id,
        image: "/edamame-beans.png",
        ingredients: ["soybeans", "sea salt"],
        preparationTime: 5,
        order: 1,
      },
      {
        name: "Gyoza",
        nameEn: "Gyoza",
        nameMn: "Гёоза",
        nameJp: "餃子",
        description: "Pan-fried pork dumplings with ponzu sauce",
        descriptionEn: "Pan-fried pork dumplings with ponzu sauce",
        descriptionMn: "Понзу соустай шарсан гахайн махны бууз",
        descriptionJp: "ポン酢ソースの豚肉餃子",
        price: 8.9,
        category: categories[0]._id,
        image: "/gyoza-dumplings.png",
        ingredients: ["pork", "cabbage", "garlic", "ginger", "ponzu sauce"],
        preparationTime: 10,
        order: 2,
      },
      // Sushi
      {
        name: "Salmon Nigiri",
        nameEn: "Salmon Nigiri",
        nameMn: "Лосось Нигири",
        nameJp: "サーモン握り",
        description: "Fresh salmon over seasoned rice",
        descriptionEn: "Fresh salmon over seasoned rice",
        descriptionMn: "Шинэ лосось дээр талхлагдсан будаа",
        descriptionJp: "新鮮なサーモンと酢飯",
        price: 12.5,
        category: categories[1]._id,
        image: "/salmon-nigiri.png",
        ingredients: ["salmon", "rice", "vinegar", "wasabi"],
        preparationTime: 8,
        order: 1,
      },
      {
        name: "Tuna Sashimi",
        nameEn: "Tuna Sashimi",
        nameMn: "Тунец Сашими",
        nameJp: "マグロ刺身",
        description: "Fresh tuna sashimi slices",
        descriptionEn: "Fresh tuna sashimi slices",
        descriptionMn: "Шинэ тунец сашими хэсгүүд",
        descriptionJp: "新鮮なマグロの刺身",
        price: 15.0,
        category: categories[1]._id,
        image: "/tuna-sashimi.png",
        ingredients: ["tuna", "wasabi", "soy sauce"],
        preparationTime: 5,
        order: 2,
      },
      // Ramen
      {
        name: "Tonkotsu Ramen",
        nameEn: "Tonkotsu Ramen",
        nameMn: "Тонкоцу Рамен",
        nameJp: "豚骨ラーメン",
        description: "Rich pork bone broth ramen with chashu",
        descriptionEn: "Rich pork bone broth ramen with chashu",
        descriptionMn: "Чашутай баян гахайн ясны шөлтэй рамен",
        descriptionJp: "チャーシュー入りの濃厚豚骨スープラーメン",
        price: 18.5,
        category: categories[2]._id,
        image: "/tonkotsu-ramen.png",
        ingredients: ["pork bone broth", "noodles", "chashu", "egg", "green onions"],
        preparationTime: 15,
        order: 1,
      },
      {
        name: "Miso Ramen",
        nameEn: "Miso Ramen",
        nameMn: "Мисо Рамен",
        nameJp: "味噌ラーメン",
        description: "Miso-flavored ramen with vegetables",
        descriptionEn: "Miso-flavored ramen with vegetables",
        descriptionMn: "Хүнсний ногоотой мисо амттай рамен",
        descriptionJp: "野菜入りの味噌ラーメン",
        price: 16.0,
        category: categories[2]._id,
        image: "/miso-ramen.png",
        ingredients: ["miso broth", "noodles", "vegetables", "corn", "bamboo shoots"],
        preparationTime: 12,
        order: 2,
      },
      // Main Courses
      {
        name: "Teriyaki Chicken",
        nameEn: "Teriyaki Chicken",
        nameMn: "Тэрияки Тахиа",
        nameJp: "照り焼きチキン",
        description: "Grilled chicken with teriyaki sauce",
        descriptionEn: "Grilled chicken with teriyaki sauce",
        descriptionMn: "Тэрияки соустай шарсан тахиа",
        descriptionJp: "照り焼きソースの焼き鳥",
        price: 22.0,
        category: categories[3]._id,
        image: "/teriyaki-chicken.png",
        ingredients: ["chicken", "teriyaki sauce", "rice", "vegetables"],
        preparationTime: 20,
        order: 1,
      },
      {
        name: "Beef Sukiyaki",
        nameEn: "Beef Sukiyaki",
        nameMn: "Үхрийн Сукияки",
        nameJp: "牛すき焼き",
        description: "Thinly sliced beef with vegetables in sweet soy broth",
        descriptionEn: "Thinly sliced beef with vegetables in sweet soy broth",
        descriptionMn: "Хүнсний ногоотой амттай шар буурцагны шөлтэй нимгэн хэсэгтэй үхрийн мах",
        descriptionJp: "野菜と甘い醤油スープの薄切り牛肉",
        price: 28.0,
        category: categories[3]._id,
        image: "/beef-sukiyaki.png",
        ingredients: ["beef", "vegetables", "tofu", "noodles", "sweet soy sauce"],
        preparationTime: 25,
        order: 2,
      },
      // Desserts
      {
        name: "Mochi Ice Cream",
        nameEn: "Mochi Ice Cream",
        nameMn: "Мочи Зайрмаг",
        nameJp: "もちアイス",
        description: "Sweet rice dough wrapped ice cream",
        descriptionEn: "Sweet rice dough wrapped ice cream",
        descriptionMn: "Чихэрлэг будааны зуурмагтай зайрмаг",
        descriptionJp: "甘い餅で包んだアイスクリーム",
        price: 7.5,
        category: categories[4]._id,
        image: "/mochi-ice-cream.png",
        ingredients: ["mochi", "ice cream", "sugar"],
        preparationTime: 3,
        order: 1,
      },
      // Beverages
      {
        name: "Green Tea",
        nameEn: "Green Tea",
        nameMn: "Ногоон цай",
        nameJp: "緑茶",
        description: "Traditional Japanese green tea",
        descriptionEn: "Traditional Japanese green tea",
        descriptionMn: "Уламжлалт Япон ногоон цай",
        descriptionJp: "伝統的な日本緑茶",
        price: 3.5,
        category: categories[5]._id,
        image: "/green-tea.png",
        ingredients: ["green tea leaves", "hot water"],
        preparationTime: 3,
        order: 1,
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
        status: "empty",
        location: "main-hall",
        qrCode: `http://localhost:3000/menu?table=${i}`,
      });
    }
    for (let i = 17; i <= 21; i++) {
      tables.push({
        number: i,
        capacity: 4,
        status: "empty",
        location: "terrace",
        qrCode: `http://localhost:3000/menu?table=${i}`,
      });
    }

    await Table.insertMany(tables);
    console.log("Seeded tables");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();

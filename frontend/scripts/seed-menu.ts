import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { Category, MenuItem, ScriptResult } from "../types/scripts.type.js";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env["MONGODB_URI"] as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

const categories: Category[] = [
  {
    nameEn: "appetizers",
    nameMn: "Завсрын хоол",
    description: "Light dishes to start your meal",
    icon: "ChefHat",
    order: 1,
    isActive: true,
  },
  {
    nameEn: "sushi",
    nameMn: "Суши",
    description: "Fresh sushi and sashimi",
    icon: "Fish",
    order: 2,
    isActive: true,
  },
  {
    nameEn: "mains",
    nameMn: "Үндсэн хоол",
    description: "Main course dishes",
    icon: "Beef",
    order: 3,
    isActive: true,
  },
  {
    nameEn: "ramen",
    nameMn: "Рамен",
    description: "Traditional Japanese noodle soup",
    icon: "Soup",
    order: 4,
    isActive: true,
  },
  {
    nameEn: "desserts",
    nameMn: "Амттан",
    description: "Sweet treats and desserts",
    icon: "Coffee",
    order: 5,
    isActive: true,
  },
];

const menuItems: MenuItem[] = [
  // Appetizers
  {
    nameEn: "Edamame",
    nameMn: "Эдамамэ",
    descriptionEn: "Steamed young soybeans with sea salt",
    descriptionMn: "Халуун ууршуулсан залуу шошны буурцаг далайн давстай",
    price: 6.5,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/edamame",
    ingredients: ["soybeans", "sea salt"],
    allergens: ["soy"],
    isSpicy: false,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isAvailable: true,
    preparationTime: 5,
    calories: 120,
    order: 1,
    categoryNameEn: "appetizers",
  },
  {
    nameEn: "Gyoza",
    nameMn: "Гёдза",
    descriptionEn: "Pan-fried pork dumplings with ponzu sauce",
    descriptionMn: "Халуун шарсан гахайн махтай банш понзу соустай",
    price: 8.9,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/gyoza",
    ingredients: ["pork", "dumpling wrapper", "ponzu sauce"],
    allergens: ["gluten", "soy"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 8,
    calories: 280,
    order: 2,
    categoryNameEn: "appetizers",
  },
  {
    nameEn: "Agedashi Tofu",
    nameMn: "Агэдаши тофу",
    descriptionEn: "Lightly fried tofu in savory dashi broth",
    descriptionMn: "Халуун шарсан тофу даши шөлтэй",
    price: 7.5,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/agedashi-tofu",
    ingredients: ["tofu", "dashi broth", "tempura flour"],
    allergens: ["soy", "gluten"],
    isSpicy: false,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 10,
    calories: 180,
    order: 3,
    categoryNameEn: "appetizers",
  },
  {
    nameEn: "Takoyaki",
    nameMn: "Такояки",
    descriptionEn: "Octopus balls with takoyaki sauce and mayo",
    descriptionMn: "Наймалжтай бөмбөлөг такояки соустай",
    price: 9.5,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/takoyaki",
    ingredients: ["octopus", "batter", "takoyaki sauce", "mayo"],
    allergens: ["gluten", "seafood"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 12,
    calories: 320,
    order: 4,
    categoryNameEn: "appetizers",
  },
  // Sushi
  {
    nameEn: "California Roll",
    nameMn: "Калифорниа ролл",
    descriptionEn: "Crab, avocado, and cucumber roll",
    descriptionMn: "Хавч, авокадо, огурцтой ролл",
    price: 12.9,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/california-roll",
    ingredients: ["crab", "avocado", "cucumber", "rice", "nori"],
    allergens: ["seafood", "soy"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isAvailable: true,
    preparationTime: 8,
    calories: 280,
    order: 1,
    categoryNameEn: "sushi",
  },
  {
    nameEn: "Salmon Nigiri",
    nameMn: "Лосось нигири",
    descriptionEn: "Fresh salmon over seasoned rice",
    descriptionMn: "Шинэ лосось үрлэн будаатай",
    price: 4.5,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/salmon-nigiri",
    ingredients: ["salmon", "rice", "wasabi"],
    allergens: ["seafood"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isAvailable: true,
    preparationTime: 5,
    calories: 120,
    order: 2,
    categoryNameEn: "sushi",
  },
  {
    nameEn: "Spicy Tuna Roll",
    nameMn: "Халуун загасны ролл",
    descriptionEn: "Spicy tuna with cucumber roll",
    descriptionMn: "Халуун загас огурцтой ролл",
    price: 14.5,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/spicy-tuna-roll",
    ingredients: ["tuna", "spicy mayo", "cucumber", "rice", "nori"],
    allergens: ["seafood", "soy"],
    isSpicy: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isAvailable: true,
    preparationTime: 10,
    calories: 320,
    order: 3,
    categoryNameEn: "sushi",
  },
  {
    nameEn: "Dragon Roll",
    nameMn: "Луу ролл",
    descriptionEn: "Eel, avocado, and cucumber with eel sauce",
    descriptionMn: "Могой загас, авокадо, огурц могой загасны соустай",
    price: 18.9,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/dragon-roll",
    ingredients: ["eel", "avocado", "cucumber", "eel sauce", "rice", "nori"],
    allergens: ["seafood", "soy"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isAvailable: true,
    preparationTime: 12,
    calories: 380,
    order: 4,
    categoryNameEn: "sushi",
  },
  // Mains
  {
    nameEn: "Teriyaki Chicken",
    nameMn: "Тэрияки тахиа",
    descriptionEn: "Grilled chicken with teriyaki sauce",
    descriptionMn: "Грилл хийсэн тахиа тэрияки соустай",
    price: 16.9,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/teriyaki-chicken",
    ingredients: ["chicken", "teriyaki sauce", "sesame seeds"],
    allergens: ["soy", "sesame"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 15,
    calories: 420,
    order: 1,
    categoryNameEn: "mains",
  },
  {
    nameEn: "Beef Sukiyaki",
    nameMn: "Үхрийн махны сукияки",
    descriptionEn: "Thinly sliced beef with vegetables in sweet soy broth",
    descriptionMn: "Нимгэн хэрчилсэн үхрийн мах хүнсний ногоотой амттай шөлтэй",
    price: 22.5,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/beef-sukiyaki",
    ingredients: ["beef", "vegetables", "sukiyaki sauce", "udon noodles"],
    allergens: ["soy", "gluten"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 20,
    calories: 580,
    order: 2,
    categoryNameEn: "mains",
  },
  {
    nameEn: "Tempura Shrimp",
    nameMn: "Тэмпура хавч",
    descriptionEn: "Crispy fried shrimp with tempura sauce",
    descriptionMn: "Хрустал хавч тэмпура соустай",
    price: 19.9,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/tempura-shrimp",
    ingredients: ["shrimp", "tempura batter", "tempura sauce"],
    allergens: ["seafood", "gluten"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 12,
    calories: 450,
    order: 3,
    categoryNameEn: "mains",
  },
  {
    nameEn: "Katsu Curry",
    nameMn: "Катсу карри",
    descriptionEn: "Breaded pork cutlet with Japanese curry",
    descriptionMn: "Хальстай гахайн мах япон карритай",
    price: 18.5,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/katsu-curry",
    ingredients: ["pork", "breadcrumbs", "curry sauce", "rice"],
    allergens: ["gluten", "soy"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 18,
    calories: 520,
    order: 4,
    categoryNameEn: "mains",
  },
  // Ramen
  {
    nameEn: "Tonkotsu Ramen",
    nameMn: "Тонкоцу рамен",
    descriptionEn: "Rich pork bone broth with chashu pork",
    descriptionMn: "Тостой гахайн ясны шөл чaшу гахайн махтай",
    price: 16.9,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/tonkotsu-ramen",
    ingredients: [
      "pork bone broth",
      "chashu pork",
      "noodles",
      "egg",
      "green onions",
    ],
    allergens: ["gluten", "soy", "egg"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 15,
    calories: 680,
    order: 1,
    categoryNameEn: "ramen",
  },
  {
    nameEn: "Miso Ramen",
    nameMn: "Мисо рамен",
    descriptionEn: "Miso-flavored broth with tofu and vegetables",
    descriptionMn: "Мисо амттай шөл тофу хүнсний ногоотой",
    price: 15.5,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/miso-ramen",
    ingredients: ["miso broth", "tofu", "vegetables", "noodles"],
    allergens: ["gluten", "soy"],
    isSpicy: false,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 12,
    calories: 520,
    order: 2,
    categoryNameEn: "ramen",
  },
  {
    nameEn: "Spicy Ramen",
    nameMn: "Халуун рамен",
    descriptionEn: "Spicy broth with ground pork and vegetables",
    descriptionMn: "Халуун шөл нунтаг гахайн мах хүнсний ногоотой",
    price: 17.9,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/spicy-ramen",
    ingredients: ["spicy broth", "ground pork", "vegetables", "noodles"],
    allergens: ["gluten", "soy"],
    isSpicy: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 14,
    calories: 620,
    order: 3,
    categoryNameEn: "ramen",
  },
  {
    nameEn: "Vegetable Ramen",
    nameMn: "Хүнсний ногооны рамен",
    descriptionEn: "Light vegetable broth with seasonal vegetables",
    descriptionMn: "Хөнгөн хүнсний ногооны шөл улирлын ногоотой",
    price: 14.9,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/vegetable-ramen",
    ingredients: ["vegetable broth", "seasonal vegetables", "noodles"],
    allergens: ["gluten"],
    isSpicy: false,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 10,
    calories: 380,
    order: 4,
    categoryNameEn: "ramen",
  },
  // Desserts
  {
    nameEn: "Mochi Ice Cream",
    nameMn: "Мочи зайрмаг",
    descriptionEn: "Sweet rice dough filled with ice cream",
    descriptionMn: "Амттай будааны зуурмаг зайрмагтай",
    price: 5.9,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/mochi-ice-cream",
    ingredients: ["mochi", "ice cream", "sugar"],
    allergens: ["dairy"],
    isSpicy: false,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isAvailable: true,
    preparationTime: 2,
    calories: 180,
    order: 1,
    categoryNameEn: "desserts",
  },
  {
    nameEn: "Dorayaki",
    nameMn: "Дораяки",
    descriptionEn: "Pancake sandwich filled with sweet red bean paste",
    descriptionMn: "Улаан буурцагны пастатай блинтэй сэндвич",
    price: 6.5,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/dorayaki",
    ingredients: ["pancake", "red bean paste", "sugar"],
    allergens: ["gluten", "soy"],
    isSpicy: false,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 3,
    calories: 220,
    order: 2,
    categoryNameEn: "desserts",
  },
  {
    nameEn: "Matcha Cheesecake",
    nameMn: "Матча бялуу",
    descriptionEn: "Creamy green tea cheesecake with graham crust",
    descriptionMn: "Ногоон цайтай тостог бялуу грахам хальстай",
    price: 8.9,
    image:
      "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/matcha-cheesecake",
    ingredients: ["cream cheese", "matcha powder", "graham crackers", "sugar"],
    allergens: ["dairy", "gluten"],
    isSpicy: false,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 5,
    calories: 320,
    order: 3,
    categoryNameEn: "desserts",
  },
];

async function seedDatabase(): Promise<ScriptResult> {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db();
    const categoriesCollection = db.collection("categories");
    const menuItemsCollection = db.collection("menuitems");

    // Clear existing data
    await categoriesCollection.deleteMany({});
    await menuItemsCollection.deleteMany({});
    console.log("🧹 Cleared existing data");

    // Insert categories first
    const categoryResult = await categoriesCollection.insertMany(categories);
    console.log(
      `✅ Successfully inserted ${categoryResult.insertedCount} categories`
    );

    // Get category ObjectIds for reference
    const categoryMap: { [key: string]: any } = {};
    const insertedCategories = await categoriesCollection.find({}).toArray();
    insertedCategories.forEach((cat: any) => {
      categoryMap[cat.nameEn] = cat._id;
    });

    // Update menu items with category ObjectIds
    const menuItemsWithCategories = menuItems.map((item) => ({
      ...item,
      category: categoryMap[item.categoryNameEn], // Use the categoryNameEn field
    }));

    // Insert menu items
    const menuResult = await menuItemsCollection.insertMany(
      menuItemsWithCategories
    );
    console.log(
      `✅ Successfully inserted ${menuResult.insertedCount} menu items`
    );

    // Verify the data
    const categoryCount = await categoriesCollection.countDocuments();
    const menuCount = await menuItemsCollection.countDocuments();
    console.log(`📊 Total categories in database: ${categoryCount}`);
    console.log(`📊 Total menu items in database: ${menuCount}`);

    return {
      success: true,
      message: `Database seeded successfully: ${categoryCount} categories, ${menuCount} menu items`,
      data: { categories: categoryCount, menuItems: menuCount },
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    return {
      success: false,
      message: "Failed to seed database",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await client.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the seed function
seedDatabase().then((result) => {
  if (result.success) {
    console.log("🎉 Database seeding completed successfully!");
  } else {
    console.error("💥 Database seeding failed:", result.error);
    process.exit(1);
  }
});

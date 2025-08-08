const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

const categories = [
  {
    nameEn: "appetizers",
    nameMn: "Завсрын хоол",
    description: "Light dishes to start your meal",
    icon: "ChefHat",
    order: 1,
    isActive: true
  },
  {
    nameEn: "sushi",
    nameMn: "Суши",
    description: "Fresh sushi and sashimi",
    icon: "Fish",
    order: 2,
    isActive: true
  },
  {
    nameEn: "mains",
    nameMn: "Үндсэн хоол",
    description: "Main course dishes",
    icon: "Beef",
    order: 3,
    isActive: true
  },
  {
    nameEn: "ramen",
    nameMn: "Рамен",
    description: "Traditional Japanese noodle soup",
    icon: "Soup",
    order: 4,
    isActive: true
  },
  {
    nameEn: "desserts",
    nameMn: "Амттан",
    description: "Sweet treats and desserts",
    icon: "Coffee",
    order: 5,
    isActive: true
  }
];

const menuItems = [
  // Appetizers
  {
    nameEn: "Edamame",
    nameMn: "Эдамамэ",
    descriptionEn: "Steamed young soybeans with sea salt",
    descriptionMn: "Халуун ууршуулсан залуу шошны буурцаг далайн давстай",
    price: 6.50,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/edamame",
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
    categoryNameEn: "appetizers"
  },
  {
    nameEn: "Gyoza",
    nameMn: "Гёдза",
    descriptionEn: "Pan-fried pork dumplings with ponzu sauce",
    descriptionMn: "Халуун шарсан гахайн махтай банш понзу соустай",
    price: 8.90,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/gyoza",
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
    categoryNameEn: "appetizers"
  },
  {
    nameEn: "Agedashi Tofu",
    nameMn: "Агэдаши тофу",
    descriptionEn: "Lightly fried tofu in savory dashi broth",
    descriptionMn: "Халуун шарсан тофу даши шөлтэй",
    price: 7.50,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/agedashi-tofu",
    ingredients: ["tofu", "dashi broth", "tempura flour"],
    allergens: ["soy", "gluten"],
    isSpicy: false,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 6,
    calories: 180,
    order: 3,
    categoryNameEn: "appetizers"
  },
  {
    nameEn: "Takoyaki",
    nameMn: "Такояки",
    descriptionEn: "Octopus balls with takoyaki sauce and bonito flakes",
    descriptionMn: "Наймалжны бөмбөлөг такояки соустай бонито хлопьятай",
    price: 9.50,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/takoyaki",
    ingredients: ["octopus", "batter", "takoyaki sauce", "bonito flakes"],
    allergens: ["fish", "gluten", "soy"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 10,
    calories: 320,
    order: 4,
    categoryNameEn: "appetizers"
  },

  // Sushi
  {
    nameEn: "Salmon Nigiri",
    nameMn: "Лосось нигири",
    descriptionEn: "Fresh Atlantic salmon over seasoned rice",
    descriptionMn: "Шинэ Атлантын лосось амтлагдсан будаатай",
    price: 3.50,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/salmon-nigiri",
    ingredients: ["salmon", "sushi rice", "nori"],
    allergens: ["fish"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isAvailable: true,
    preparationTime: 3,
    calories: 45,
    order: 1,
    categoryNameEn: "sushi"
  },
  {
    nameEn: "Tuna Nigiri",
    nameMn: "Тунец нигири",
    descriptionEn: "Premium bluefin tuna over seasoned rice",
    descriptionMn: "Дээд зэргийн хөх тунец амтлагдсан будаатай",
    price: 4.50,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/tuna-nigiri",
    ingredients: ["tuna", "sushi rice", "nori"],
    allergens: ["fish"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isAvailable: true,
    preparationTime: 3,
    calories: 55,
    order: 2,
    categoryNameEn: "sushi"
  },
  {
    nameEn: "California Roll",
    nameMn: "Калифорни ролл",
    descriptionEn: "Crab, avocado, cucumber with sesame seeds",
    descriptionMn: "Хавч, авокадо, өргөст хэмхтэй кунжутын үртэй",
    price: 8.90,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/california-roll",
    ingredients: ["crab", "avocado", "cucumber", "sesame seeds", "sushi rice"],
    allergens: ["fish", "shellfish"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isAvailable: true,
    preparationTime: 7,
    calories: 280,
    order: 3,
    categoryNameEn: "sushi"
  },
  {
    nameEn: "Dragon Roll",
    nameMn: "Драгон ролл",
    descriptionEn: "Eel, cucumber topped with avocado and eel sauce",
    descriptionMn: "Морской угорь, өргөст хэмхтэй авокадо болон угорь соустай",
    price: 14.50,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/dragon-roll",
    ingredients: ["eel", "cucumber", "avocado", "eel sauce", "sushi rice"],
    allergens: ["fish", "soy"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 8,
    calories: 420,
    order: 4,
    categoryNameEn: "sushi"
  },
  {
    nameEn: "Rainbow Roll",
    nameMn: "Солонгон ролл",
    descriptionEn: "California roll topped with assorted sashimi",
    descriptionMn: "Калифорни роллтэй олон төрлийн сашими",
    price: 16.90,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/rainbow-roll",
    ingredients: ["assorted fish", "avocado", "cucumber", "sushi rice"],
    allergens: ["fish"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isAvailable: true,
    preparationTime: 10,
    calories: 380,
    order: 5,
    categoryNameEn: "sushi"
  },

  // Mains
  {
    nameEn: "Chicken Teriyaki",
    nameMn: "Тахианы терияки",
    descriptionEn: "Grilled chicken with teriyaki glaze, steamed rice",
    descriptionMn: "Грилл хийсэн тахиа терияки соустай ууршуулсан будаатай",
    price: 16.50,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/chicken-teriyaki",
    ingredients: ["chicken", "teriyaki sauce", "rice", "vegetables"],
    allergens: ["soy", "gluten"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 15,
    calories: 450,
    order: 1,
    categoryNameEn: "mains"
  },
  {
    nameEn: "Beef Yakitori",
    nameMn: "Үхрийн махны якитори",
    descriptionEn: "Grilled beef skewers with tare sauce",
    descriptionMn: "Грилл хийсэн үхрийн махны шүд тэри тари соустай",
    price: 18.90,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/beef-yakitori",
    ingredients: ["beef", "tare sauce", "vegetables"],
    allergens: ["soy", "gluten"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 12,
    calories: 520,
    order: 2,
    categoryNameEn: "mains"
  },
  {
    nameEn: "Salmon Shioyaki",
    nameMn: "Лосось шиояки",
    descriptionEn: "Salt-grilled salmon with daikon radish",
    descriptionMn: "Давстай шарсан лосось дайкон хялгастай",
    price: 19.50,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/salmon-shioyaki",
    ingredients: ["salmon", "salt", "daikon radish"],
    allergens: ["fish"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isAvailable: true,
    preparationTime: 14,
    calories: 380,
    order: 3,
    categoryNameEn: "mains"
  },
  {
    nameEn: "Tonkatsu",
    nameMn: "Тонкацу",
    descriptionEn: "Breaded pork cutlet with tonkatsu sauce",
    descriptionMn: "Халуун шарсан гахайн махны хэсэг тонкацу соустай",
    price: 17.50,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/tonkatsu",
    ingredients: ["pork", "breadcrumbs", "tonkatsu sauce"],
    allergens: ["gluten", "soy"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 16,
    calories: 480,
    order: 4,
    categoryNameEn: "mains"
  },

  // Ramen
  {
    nameEn: "Tonkotsu Ramen",
    nameMn: "Тонкоцу рамен",
    descriptionEn: "Rich pork bone broth with chashu, egg, and scallions",
    descriptionMn: "Тохимол гахайн ясны шөлтэй чашу, өндөг, ногоон сонгинотой",
    price: 14.90,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/tonkotsu-ramen",
    ingredients: ["pork bone broth", "chashu", "egg", "scallions", "noodles"],
    allergens: ["gluten", "soy", "eggs"],
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 12,
    calories: 580,
    order: 1,
    categoryNameEn: "ramen"
  },
  {
    nameEn: "Miso Ramen",
    nameMn: "Мисо рамен",
    descriptionEn: "Fermented soybean paste broth with corn and butter",
    descriptionMn: "Исгэсэн шошны пастатай шөлтэй эрдэнэ шиш, цөцгийн тостой",
    price: 13.50,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/miso-ramen",
    ingredients: ["miso paste", "corn", "butter", "noodles"],
    allergens: ["gluten", "soy", "dairy"],
    isSpicy: false,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 10,
    calories: 520,
    order: 2,
    categoryNameEn: "ramen"
  },
  {
    nameEn: "Shoyu Ramen",
    nameMn: "Шою рамен",
    descriptionEn: "Clear soy sauce broth with bamboo shoots",
    descriptionMn: "Цэвэр шошны соустай шөлтэй хулсны мөчиртэй",
    price: 12.90,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/shoyu-ramen",
    ingredients: ["soy sauce broth", "bamboo shoots", "noodles"],
    allergens: ["gluten", "soy"],
    isSpicy: false,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 8,
    calories: 480,
    order: 3,
    categoryNameEn: "ramen"
  },
  {
    nameEn: "Spicy Miso Ramen",
    nameMn: "Халуун мисо рамен",
    descriptionEn: "Spicy miso broth with ground pork and bean sprouts",
    descriptionMn: "Халуун мисо шөлтэй нунтаг гахайн мах, буурцагны мөчиртэй",
    price: 15.50,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/spicy-miso-ramen",
    ingredients: ["spicy miso paste", "ground pork", "bean sprouts", "noodles"],
    allergens: ["gluten", "soy"],
    isSpicy: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 11,
    calories: 620,
    order: 4,
    categoryNameEn: "ramen"
  },

  // Desserts
  {
    nameEn: "Mochi Ice Cream",
    nameMn: "Мочи зайрмаг",
    descriptionEn: "Sweet rice cake filled with ice cream (3 pieces)",
    descriptionMn: "Зайрмагтай дүүрэг чихэрлэг будааны бялуу (3 ширхэг)",
    price: 7.50,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/mochi-ice-cream",
    ingredients: ["rice flour", "ice cream", "sugar"],
    allergens: ["dairy"],
    isSpicy: false,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isAvailable: true,
    preparationTime: 2,
    calories: 180,
    order: 1,
    categoryNameEn: "desserts"
  },
  {
    nameEn: "Dorayaki",
    nameMn: "Дораяки",
    descriptionEn: "Pancake sandwich filled with sweet red bean paste",
    descriptionMn: "Улаан буурцагны пастатай блинтэй сэндвич",
    price: 6.50,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/dorayaki",
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
    categoryNameEn: "desserts"
  },
  {
    nameEn: "Matcha Cheesecake",
    nameMn: "Матча бялуу",
    descriptionEn: "Creamy green tea cheesecake with graham crust",
    descriptionMn: "Ногоон цайтай тостог бялуу грахам хальстай",
    price: 8.90,
    image: "https://res.cloudinary.com/dxlufhjua/image/upload/w_300,h_300,c_fill,q_auto/menu/menu/matcha-cheesecake",
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
    categoryNameEn: "desserts"
  }
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db();
    const categoriesCollection = db.collection('categories');
    const menuItemsCollection = db.collection('menuitems');
    
    // Clear existing data
    await categoriesCollection.deleteMany({});
    await menuItemsCollection.deleteMany({});
    console.log('Cleared existing data');
    
    // Insert categories first
    const categoryResult = await categoriesCollection.insertMany(categories);
    console.log(`Successfully inserted ${categoryResult.insertedCount} categories`);
    
    // Get category ObjectIds for reference
    const categoryMap = {};
    const insertedCategories = await categoriesCollection.find({}).toArray();
    insertedCategories.forEach(cat => {
      categoryMap[cat.nameEn] = cat._id;
    });
    
    // Update menu items with category ObjectIds
    const menuItemsWithCategories = menuItems.map(item => ({
      ...item,
      category: categoryMap[item.categoryNameEn] // Use the categoryNameEn field
    }));
    
    // Insert menu items
    const menuResult = await menuItemsCollection.insertMany(menuItemsWithCategories);
    console.log(`Successfully inserted ${menuResult.insertedCount} menu items`);
    
    // Verify the data
    const categoryCount = await categoriesCollection.countDocuments();
    const menuCount = await menuItemsCollection.countDocuments();
    console.log(`Total categories in database: ${categoryCount}`);
    console.log(`Total menu items in database: ${menuCount}`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

seedDatabase(); 
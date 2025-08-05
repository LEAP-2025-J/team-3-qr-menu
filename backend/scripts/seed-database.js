const mongoose = require("mongoose")
require("dotenv").config({ path: ".env.local" })

// Import models
const Category = require("../models/Category")
const MenuItem = require("../models/MenuItem")
const Table = require("../models/Table")

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await Category.deleteMany({})
    await MenuItem.deleteMany({})
    await Table.deleteMany({})
    console.log("Cleared existing data")

    // Seed Categories
    const categories = await Category.insertMany([
      {
        name: "appetizers",
        nameEn: "Appetizers",
        nameMn: "Хоолны өмнөх",
        description: "Start your meal with these delicious appetizers",
        icon: "ChefHat",
        order: 1,
      },
      {
        name: "sushi",
        nameEn: "Sushi",
        nameMn: "Суши",
        description: "Fresh sushi and sashimi",
        icon: "Fish",
        order: 2,
      },
      {
        name: "ramen",
        nameEn: "Ramen",
        nameMn: "Рамен",
        description: "Authentic Japanese ramen bowls",
        icon: "Soup",
        order: 3,
      },
      {
        name: "mains",
        nameEn: "Main Dishes",
        nameMn: "Үндсэн хоол",
        description: "Traditional Japanese main courses",
        icon: "Beef",
        order: 4,
      },
      {
        name: "desserts",
        nameEn: "Desserts",
        nameMn: "Амттан",
        description: "Sweet endings to your meal",
        icon: "Coffee",
        order: 5,
      },
    ])

    console.log("Seeded categories")

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
        category: categories[0]._id,
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
        category: categories[0]._id,
        image: "/gyoza-dumplings.png",
        ingredients: ["pork", "cabbage", "garlic", "ginger", "ponzu sauce"],
        allergens: ["gluten", "soy"],
        preparationTime: 10,
        calories: 280,
        order: 2,
      },
      // Sushi
      {
        name: "Salmon Nigiri",
        nameEn: "Salmon Nigiri",
        nameMn: "Хулд загасны нигири",
        description: "Fresh Atlantic salmon over seasoned rice",
        descriptionEn: "Fresh Atlantic salmon over seasoned rice",
        descriptionMn: "Амталсан будааны дээр шинэхэн Атлантын хулд загас",
        price: 3.5,
        category: categories[1]._id,
        image: "/salmon-nigiri.png",
        ingredients: ["salmon", "sushi rice", "wasabi"],
        allergens: ["fish"],
        preparationTime: 3,
        calories: 70,
        order: 1,
      },
      // Ramen
      {
        name: "Tonkotsu Ramen",
        nameEn: "Tonkotsu Ramen",
        nameMn: "Тонкотсу рамен",
        description: "Rich pork bone broth with chashu, egg, and scallions",
        descriptionEn: "Rich pork bone broth with chashu, egg, and scallions",
        descriptionMn: "Гахайн ясны баялаг шөлтэй часу, өндөг, сонгино",
        price: 14.9,
        category: categories[2]._id,
        image: "/tonkotsu-ramen.png",
        ingredients: ["pork broth", "ramen noodles", "chashu pork", "soft-boiled egg", "scallions"],
        allergens: ["gluten", "eggs"],
        preparationTime: 15,
        calories: 650,
        order: 1,
      },
    ]

    await MenuItem.insertMany(menuItems)
    console.log("Seeded menu items")

    // Seed Tables
    const tables = []
    for (let i = 1; i <= 20; i++) {
      tables.push({
        number: i,
        capacity: i <= 10 ? 2 : i <= 15 ? 4 : 6,
        qrCode: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}?table=${i}`,
        location: i <= 10 ? "Main Floor" : "Upper Floor",
      })
    }

    await Table.insertMany(tables)
    console.log("Seeded tables")

    console.log("Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()

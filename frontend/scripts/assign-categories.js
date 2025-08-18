const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://togtoh:Random011021@cluster0.rds2ass.mongodb.net/menu';

async function assignCategories() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const menuCollection = db.collection('menuitems');
    const categoryCollection = db.collection('categories');
    
    console.log('\n📋 Checking existing categories...');
    
    // Get all categories
    const categories = await categoryCollection.find({}).toArray();
    console.log(`📂 Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`   - ${cat.nameEn} (ID: ${cat._id})`);
    });
    
    if (categories.length === 0) {
      console.log('\n❌ No categories found. Please run your seed script first to create categories.');
      return;
    }
    
    console.log('\n🔍 Assigning categories to menu items...');
    
    // Define category mapping based on item names
    const categoryMapping = {
      // Appetizers
      "Edamame": "Appetizers",
      "Gyoza": "Appetizers",
      
      // Sushi
      "Salmon Nigiri": "Sushi",
      "Tuna Sashimi": "Sushi",
      
      // Main Dishes
      "Teriyaki Chicken": "Main Courses",
      "Beef Sukiyaki": "Main Courses",
      
      // Ramen
      "Tonkotsu Ramen": "Ramen",
      "Miso Ramen": "Ramen",
      
      // Desserts
      "Mochi Ice Cream": "Desserts",
      "Mochi": "Desserts",
      "Green Tea": "Beverages"
    };
    
    let updatedCount = 0;
    
    for (const [itemName, categoryName] of Object.entries(categoryMapping)) {
      try {
        // Find the category ID
        const category = categories.find(cat => cat.nameEn === categoryName);
        if (!category) {
          console.log(`⚠️  Category "${categoryName}" not found for ${itemName}`);
          continue;
        }
        
        // Update the menu item
        const result = await menuCollection.updateOne(
          { nameEn: itemName },
          { 
            $set: { 
              category: category._id,
              categoryNameEn: categoryName
            } 
          }
        );
        
        if (result.matchedCount > 0) {
          if (result.modifiedCount > 0) {
            console.log(`✅ Updated: ${itemName} → ${categoryName}`);
            updatedCount++;
          } else {
            console.log(`ℹ️  No changes needed: ${itemName}`);
          }
        } else {
          console.log(`⚠️  Menu item not found: ${itemName}`);
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${itemName}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Category assignment completed!`);
    console.log(`   ✅ Updated: ${updatedCount} items`);
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const updatedItems = await menuCollection.find({ category: { $exists: true } }).toArray();
    
    console.log(`📋 Found ${updatedItems.length} items with categories:`);
    updatedItems.forEach(item => {
      const categoryName = item.categoryNameEn || 'Unknown';
      const hasImage = item.image ? '✅' : '❌';
      console.log(`   ${hasImage} ${item.nameEn} - ${categoryName}`);
    });
    
    // Show items still without categories
    const itemsWithoutCategory = await menuCollection.find({ 
      $or: [
        { category: { $exists: false } },
        { category: null }
      ]
    }).toArray();
    
    if (itemsWithoutCategory.length > 0) {
      console.log(`\n⚠️  Found ${itemsWithoutCategory.length} items still without categories:`);
      itemsWithoutCategory.forEach(item => {
        console.log(`   - ${item.nameEn}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the script
assignCategories().catch(console.error); 
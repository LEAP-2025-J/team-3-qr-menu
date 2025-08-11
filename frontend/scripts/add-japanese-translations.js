const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://togtoh:Random011021@cluster0.rds2ass.mongodb.net/menu';

// Japanese translations for menu items
const japaneseTranslations = {
  "California Roll": {
    nameJa: "カリフォルニアロール",
    descriptionJa: "カニ、アボカド、キュウリ"
  },
  "Mochi": {
    nameJa: "もち",
    descriptionJa: "餅菓子"
  },
  "Green Tea": {
    nameJa: "緑茶",
    descriptionJa: "熱い緑茶"
  },
  "Teriyaki Chicken": {
    nameJa: "照り焼きチキン",
    descriptionJa: "照り焼きソースのチキン"
  },
  "Tonkotsu Ramen": {
    nameJa: "とんこつラーメン",
    descriptionJa: "豚骨スープのラーメン"
  },
  "Edamame": {
    nameJa: "枝豆",
    descriptionJa: "塩味の蒸し枝豆"
  }
};

// Japanese translations for categories
const categoryJapaneseTranslations = {
  "Appetizers": "前菜",
  "Sushi": "寿司",
  "Ramen": "ラーメン",
  "Main Dishes": "メインディッシュ",
  "Desserts": "デザート",
  "Drinks": "ドリンク"
};

async function addJapaneseTranslations() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('menuitems');
    
    console.log('\n🇯🇵 Adding Japanese translations to menu items...');
    
    let updatedCount = 0;
    
    for (const [itemName, translations] of Object.entries(japaneseTranslations)) {
      try {
        const result = await collection.updateOne(
          { nameEn: itemName },
          { 
            $set: { 
              nameJa: translations.nameJa,
              descriptionJa: translations.descriptionJa
            } 
          }
        );
        
        if (result.matchedCount > 0) {
          if (result.modifiedCount > 0) {
            console.log(`✅ Updated: ${itemName} → ${translations.nameJa}`);
            updatedCount++;
          } else {
            console.log(`ℹ️  No changes needed: ${itemName}`);
          }
        } else {
          console.log(`⚠️  Not found: ${itemName}`);
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${itemName}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Japanese translations added to ${updatedCount} menu items.`);
    
    // Verify the updates
    console.log('\n🔍 Verifying Japanese translations...');
    const updatedItems = await collection.find({ nameJa: { $exists: true } }).toArray();
    
    console.log(`📝 Found ${updatedItems.length} items with Japanese names:`);
    updatedItems.forEach(item => {
      console.log(`   - ${item.nameEn}: ${item.nameJa}`);
    });
    
    // Also update categories with Japanese names
    console.log('\n🏷️  Updating categories with Japanese names...');
    const categoryCollection = db.collection('categories');
    
    for (const [categoryEn, categoryJa] of Object.entries(categoryJapaneseTranslations)) {
      try {
        const result = await categoryCollection.updateOne(
          { nameEn: categoryEn },
          { $set: { nameJa: categoryJa } }
        );
        
        if (result.matchedCount > 0) {
          if (result.modifiedCount > 0) {
            console.log(`✅ Updated category: ${categoryEn} → ${categoryJa}`);
          } else {
            console.log(`ℹ️  Category already updated: ${categoryEn}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error updating category ${categoryEn}:`, error.message);
      }
    }
    
    console.log('\n🚀 Japanese translations setup completed!');
    console.log('   Your menu now supports Japanese language switching.');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the script
addJapaneseTranslations().catch(console.error); 
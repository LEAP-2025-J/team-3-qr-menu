const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://togtoh:Random011021@cluster0.rds2ass.mongodb.net/menu';

async function cleanDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('menuitems');
    
    console.log('\n🧹 Cleaning up invalid menu items...');
    
    // Get all menu items
    const allMenuItems = await collection.find({}).toArray();
    console.log(`📊 Found ${allMenuItems.length} total menu items`);
    
    // Identify invalid items (single characters or very short names)
    const invalidItems = allMenuItems.filter(item => 
      item.nameEn && (
        item.nameEn.length <= 2 || 
        /^[a-z]$/i.test(item.nameEn) ||
        item.nameEn.trim() === ''
      )
    );
    
    if (invalidItems.length > 0) {
      console.log(`\n❌ Found ${invalidItems.length} invalid items to remove:`);
      invalidItems.forEach(item => {
        console.log(`   - "${item.nameEn}" (ID: ${item._id})`);
      });
      
      // Remove invalid items
      const deleteResult = await collection.deleteMany({
        _id: { $in: invalidItems.map(item => item._id) }
      });
      
      console.log(`\n🗑️  Removed ${deleteResult.deletedCount} invalid items`);
    } else {
      console.log('\n✅ No invalid items found');
    }
    
    // Show remaining valid items
    const remainingItems = await collection.find({}).toArray();
    console.log(`\n📋 Remaining valid menu items (${remainingItems.length}):`);
    remainingItems.forEach(item => {
      const hasImage = item.image ? '✅' : '❌';
      console.log(`   ${hasImage} ${item.nameEn} - ${item.categoryNameEn || 'No category'}`);
    });
    
    // Check for items without categories
    const itemsWithoutCategory = remainingItems.filter(item => !item.categoryNameEn);
    if (itemsWithoutCategory.length > 0) {
      console.log(`\n⚠️  Found ${itemsWithoutCategory.length} items without categories:`);
      itemsWithoutCategory.forEach(item => {
        console.log(`   - ${item.nameEn}`);
      });
    }
    
    console.log('\n🎉 Database cleanup completed!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the script
cleanDatabase().catch(console.error); 
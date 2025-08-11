const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://togtoh:Random011021@cluster0.rds2ass.mongodb.net/menu';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxlufhjua';

// Menu item to image mapping
const menuImageMapping = {
  "California Roll": "menu/menu/california-roll",
  "Mochi": "menu/menu/dorayaki",
  "Green Tea": "menu/menu/matcha-cheesecake",
  "Teriyaki Chicken": "menu/menu/chicken-teriyaki",
  "Tonkotsu Ramen": "menu/menu/miso-ramen",
  "Edamame": "menu/menu/edamame"
};

// Function to get Cloudinary URL
function getCloudinaryUrl(publicId) {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_300,c_fill,q_auto/${publicId}`;
}

async function updateDatabaseImages() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('menuitems');
    
    console.log('\n📋 Updating menu items with images...');
    
    let updatedCount = 0;
    
    for (const [itemName, imageId] of Object.entries(menuImageMapping)) {
      try {
        const imageUrl = getCloudinaryUrl(imageId);
        
        const result = await collection.updateOne(
          { nameEn: itemName },
          { $set: { image: imageUrl } }
        );
        
        if (result.matchedCount > 0) {
          if (result.modifiedCount > 0) {
            console.log(`✅ Updated: ${itemName} → ${imageUrl}`);
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
    
    console.log(`\n🎉 Update completed! Updated ${updatedCount} menu items.`);
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const updatedItems = await collection.find({ image: { $exists: true } }).toArray();
    
    console.log(`📸 Found ${updatedItems.length} items with images:`);
    updatedItems.forEach(item => {
      console.log(`   - ${item.nameEn}: ${item.image}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the script
updateDatabaseImages().catch(console.error); 
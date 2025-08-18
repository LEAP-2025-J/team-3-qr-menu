const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://togtoh:Random011021@cluster0.rds2ass.mongodb.net/menu';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxlufhjua';

// Complete menu item to image mapping based on your actual Cloudinary images
const menuImageMapping = {
  // Appetizers
  "Edamame": "menu/menu/edamame",
  "Gyoza": "menu/menu/gyoza",
  "Agedashi Tofu": "menu/menu/agedashi-tofu",
  "Takoyaki": "menu/menu/takoyaki",
  
  // Sushi
  "California Roll": "menu/menu/california-roll",
  "Salmon Nigiri": "menu/menu/salmon-nigiri",
  "Tuna Nigiri": "menu/menu/tuna-nigiri",
  "Tuna Sashimi": "menu/menu/tuna-nigiri", // Using tuna-nigiri image
  "Dragon Roll": "menu/menu/dragon-roll",
  "Rainbow Roll": "menu/menu/rainbow-roll",
  
  // Main Dishes
  "Chicken Teriyaki": "menu/menu/chicken-teriyaki",
  "Teriyaki Chicken": "menu/menu/chicken-teriyaki", // Alternative name
  "Beef Yakitori": "menu/menu/beef-yakitori",
  "Beef Sukiyaki": "menu/menu/beef-yakitori", // Alternative name
  "Salmon Shioyaki": "menu/menu/salmon-shioyaki",
  "Tonkatsu": "menu/menu/tonkatsu",
  
  // Ramen
  "Tonkotsu Ramen": "menu/menu/tonkotsu-ramen",
  "Miso Ramen": "menu/menu/miso-ramen",
  "Shoyu Ramen": "menu/menu/shoyu-ramen",
  "Spicy Miso Ramen": "menu/menu/spicy-miso-ramen",
  
  // Desserts
  "Mochi Ice Cream": "menu/menu/mochi-ice-cream",
  "Mochi": "menu/menu/mochi-ice-cream", // Alternative name
  "Matcha Cheesecake": "menu/menu/matcha-cheesecake",
  "Green Tea": "menu/menu/matcha-cheesecake", // Alternative name
  "Dorayaki": "menu/menu/dorayaki"
};

// Function to get Cloudinary URL
function getCloudinaryUrl(publicId) {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_300,c_fill,q_auto/${publicId}`;
}

async function connectCloudinaryImages() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('menuitems');
    
    console.log('\n📋 Checking existing menu items...');
    
    // Get all menu items from database
    const allMenuItems = await collection.find({}).toArray();
    console.log(`📊 Found ${allMenuItems.length} menu items in database`);
    
    console.log('\n🔍 Checking which items need image updates...');
    
    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;
    
    for (const menuItem of allMenuItems) {
      const itemName = menuItem.nameEn;
      const currentImage = menuItem.image;
      
      if (menuImageMapping[itemName]) {
        const imageUrl = getCloudinaryUrl(menuImageMapping[itemName]);
        
        // Check if image needs updating
        if (currentImage !== imageUrl) {
          try {
            const result = await collection.updateOne(
              { _id: menuItem._id },
              { 
                $set: { 
                  image: imageUrl,
                  imagePublicId: menuImageMapping[itemName]
                } 
              }
            );
            
            if (result.modifiedCount > 0) {
              console.log(`✅ Updated: ${itemName} → ${imageUrl}`);
              updatedCount++;
            } else {
              console.log(`ℹ️  No changes needed: ${itemName}`);
              skippedCount++;
            }
          } catch (error) {
            console.error(`❌ Error updating ${itemName}:`, error.message);
          }
        } else {
          console.log(`ℹ️  Already has correct image: ${itemName}`);
          skippedCount++;
        }
      } else {
        console.log(`⚠️  No image mapping found for: ${itemName}`);
        notFoundCount++;
      }
    }
    
    console.log(`\n🎉 Update completed!`);
    console.log(`   ✅ Updated: ${updatedCount} items`);
    console.log(`   ℹ️  Skipped: ${skippedCount} items`);
    console.log(`   ⚠️  No mapping: ${notFoundCount} items`);
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const itemsWithImages = await collection.find({ image: { $exists: true, $ne: null } }).toArray();
    
    console.log(`📸 Found ${itemsWithImages.length} items with images:`);
    itemsWithImages.forEach(item => {
      console.log(`   - ${item.nameEn}: ${item.image ? '✅ Has image' : '❌ No image'}`);
    });
    
    // Show items without images
    const itemsWithoutImages = await collection.find({ 
      $or: [
        { image: { $exists: false } },
        { image: null },
        { image: "" }
      ]
    }).toArray();
    
    if (itemsWithoutImages.length > 0) {
      console.log(`\n❌ Found ${itemsWithoutImages.length} items without images:`);
      itemsWithoutImages.forEach(item => {
        console.log(`   - ${item.nameEn}`);
      });
      
      console.log('\n💡 To add images for these items:');
      console.log('   1. Upload images to Cloudinary');
      console.log('   2. Add them to the menuImageMapping object');
      console.log('   3. Run this script again');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the script
connectCloudinaryImages().catch(console.error); 
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Map your current menu items to available Cloudinary image public IDs
const menuImageMapping = {
  "California Roll": "menu/menu/california-roll",
  "Mochi": "menu/menu/dorayaki", // Using dorayaki as it's similar to mochi
  "Green Tea": "menu/menu/matcha-cheesecake", // Using matcha item as placeholder
  "Teriyaki Chicken": "menu/menu/chicken-teriyaki",
  "Tonkotsu Ramen": "menu/menu/miso-ramen", // Using miso ramen as it's available
  "Edamame": "menu/menu/edamame"
};

// Function to get Cloudinary URL for a public ID
function getCloudinaryUrl(publicId) {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_300,c_fill,q_auto/${publicId}`;
}

// Function to update menu items in MongoDB
async function updateMenuImages() {
  try {
    console.log('🔍 Checking Cloudinary images...');
    
    // Test Cloudinary connection
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'menu/',
      max_results: 20
    });
    
    console.log('✅ Cloudinary connection successful');
    console.log(`📁 Found ${result.resources.length} images in menu folder`);
    
    // List available images
    result.resources.forEach(img => {
      console.log(`   - ${img.public_id}`);
    });
    
    console.log('\n📋 Menu item to image mapping:');
    Object.entries(menuImageMapping).forEach(([itemName, imageId]) => {
      const imageUrl = getCloudinaryUrl(imageId);
      console.log(`   ${itemName} → ${imageUrl}`);
    });
    
    console.log('\n💡 To update your database, you can:');
    console.log('   1. Use the MongoDB update commands below');
    console.log('   2. Or create an admin panel to update images');
    console.log('   3. Or modify your seed script to include images');
    
    console.log('\n📝 MongoDB update commands:');
    Object.entries(menuImageMapping).forEach(([itemName, imageId]) => {
      const imageUrl = getCloudinaryUrl(imageId);
      console.log(`   db.menuitems.updateOne({nameEn: "${itemName}"}, {$set: {image: "${imageUrl}"}})`);
    });
    
    console.log('\n🚀 Ready to update database!');
    console.log('   Run the MongoDB commands above or use the admin panel.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
updateMenuImages().catch(console.error); 
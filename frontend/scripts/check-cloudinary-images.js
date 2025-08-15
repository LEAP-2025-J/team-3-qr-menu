const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxlufhjua',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkCloudinaryImages() {
  try {
    console.log('🔍 Checking Cloudinary images...');
    console.log(`☁️  Cloud name: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxlufhjua'}`);
    
    // Test Cloudinary connection
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'menu/',
      max_results: 100
    });
    
    console.log('✅ Cloudinary connection successful');
    console.log(`📁 Found ${result.resources.length} images in menu folder`);
    
    // Group images by subfolder
    const imageGroups = {};
    result.resources.forEach(img => {
      const parts = img.public_id.split('/');
      const subfolder = parts[1] || 'root';
      if (!imageGroups[subfolder]) {
        imageGroups[subfolder] = [];
      }
      imageGroups[subfolder].push(img.public_id);
    });
    
    // Display organized results
    Object.entries(imageGroups).forEach(([subfolder, images]) => {
      console.log(`\n📂 ${subfolder}/`);
      images.forEach(img => {
        console.log(`   - ${img}`);
      });
    });
    
    // Show total count
    console.log(`\n📊 Total images found: ${result.resources.length}`);
    
    // Check for specific menu items
    const menuItems = [
      "edamame", "gyoza", "agedashi-tofu",
      "california-roll", "salmon-nigiri", "tuna-sashimi", "spicy-tuna-roll",
      "teriyaki-chicken", "beef-sukiyaki", "grilled-salmon", "tempura-shrimp",
      "tonkotsu-ramen", "miso-ramen", "shoyu-ramen",
      "mochi", "matcha-ice-cream", "dorayaki"
    ];
    
    console.log('\n🔍 Checking for specific menu item images:');
    menuItems.forEach(item => {
      const found = result.resources.some(img => img.public_id.includes(item));
      console.log(`   ${found ? '✅' : '❌'} ${item}`);
    });
    
    console.log('\n💡 Next steps:');
    console.log('   1. Run connect-cloudinary-images.js to update your database');
    console.log('   2. Or manually update specific items using the admin panel');
    console.log('   3. Upload missing images to Cloudinary if needed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('   - CLOUDINARY_API_KEY in your .env file');
    console.log('   - CLOUDINARY_API_SECRET in your .env file');
    console.log('   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your .env file');
  }
}

// Run the script
checkCloudinaryImages().catch(console.error); 
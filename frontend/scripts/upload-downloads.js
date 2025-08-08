const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Map of file names to menu item names
const imageMapping = {
  'edamame.jpg': 'menu/edamame',
  'gyoza.jpg': 'menu/gyoza',
  'Agedashi Tofu.webp': 'menu/agedashi-tofu',
  'Takoyaki.png': 'menu/takoyaki',
  'Salmon Nigiri.jpg': 'menu/salmon-nigiri',
  'Tuna Nigiri.jpeg': 'menu/tuna-nigiri',
  'California Roll.jpg': 'menu/california-roll',
  'Dragon Roll.jpg': 'menu/dragon-roll',
  'Rainbow Roll.webp': 'menu/rainbow-roll',
  'Chicken Teriyaki.webp': 'menu/chicken-teriyaki',
  'Beef Yakitori.jpeg': 'menu/beef-yakitori',
  'Salmon Shioyaki.jpg': 'menu/salmon-shioyaki',
  'Tonkatsu.jpg': 'menu/tonkatsu',
  'Tonkotsu Ramen.webp': 'menu/tonkotsu-ramen',
  'Miso Ramen.webp': 'menu/miso-ramen',
  'Shoyu Ramen.jpg': 'menu/shoyu-ramen',
  'Spicy Miso Ramen.jpg': 'menu/spicy-miso-ramen',
  'Mochi Ice Cream.jpg': 'menu/mochi-ice-cream',
  'Dorayaki.jpg': 'menu/dorayaki',
  'Matcha Cheesecake.jpg': 'menu/matcha-cheesecake'
};

async function uploadImagesFromDownloads() {
  console.log('🚀 Starting upload of food images from Downloads...');
  
  const downloadsPath = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads');
  
  for (const [fileName, publicId] of Object.entries(imageMapping)) {
    const filePath = path.join(downloadsPath, fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fileName}`);
      continue;
    }
    
    try {
      console.log(`📤 Uploading ${fileName}...`);
      
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        folder: 'menu',
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto' }
        ]
      });
      
      console.log(`✅ Successfully uploaded: ${publicId}`);
      console.log(`   URL: ${result.secure_url}`);
      console.log(`   Public ID: ${result.public_id}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Failed to upload ${fileName}:`, error.message);
    }
  }
  
  console.log('🎉 Upload process completed!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Update your .env file with your Cloudinary credentials');
  console.log('2. Run this script again to upload to your account');
  console.log('3. Update the seed script with your cloud name');
  console.log('4. Re-run: node scripts/seed-menu.js');
}

// Check if Cloudinary credentials are set
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  console.log('⚠️  Cloudinary credentials not found in .env file');
  console.log('Please add your Cloudinary credentials to .env:');
  console.log('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('CLOUDINARY_API_KEY=your_api_key');
  console.log('CLOUDINARY_API_SECRET=your_api_secret');
  console.log('');
  console.log('You can get these from your Cloudinary dashboard at:');
  console.log('https://cloudinary.com/console');
} else {
  uploadImagesFromDownloads().catch(console.error);
} 
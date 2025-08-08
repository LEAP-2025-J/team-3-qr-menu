const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// List of images to upload (update these paths to your actual image files)
const imagesToUpload = [
  { path: './images/edamame.jpg', publicId: 'menu/edamame' },
  { path: './images/gyoza.jpg', publicId: 'menu/gyoza' },
  { path: './images/agedashi-tofu.jpg', publicId: 'menu/agedashi-tofu' },
  { path: './images/takoyaki.jpg', publicId: 'menu/takoyaki' },
  { path: './images/salmon-nigiri.jpg', publicId: 'menu/salmon-nigiri' },
  { path: './images/tuna-nigiri.jpg', publicId: 'menu/tuna-nigiri' },
  { path: './images/california-roll.jpg', publicId: 'menu/california-roll' },
  { path: './images/dragon-roll.jpg', publicId: 'menu/dragon-roll' },
  { path: './images/rainbow-roll.jpg', publicId: 'menu/rainbow-roll' },
  { path: './images/chicken-teriyaki.jpg', publicId: 'menu/chicken-teriyaki' },
  { path: './images/beef-yakitori.jpg', publicId: 'menu/beef-yakitori' },
  { path: './images/salmon-shioyaki.jpg', publicId: 'menu/salmon-shioyaki' },
  { path: './images/tonkatsu.jpg', publicId: 'menu/tonkatsu' },
  { path: './images/tonkotsu-ramen.jpg', publicId: 'menu/tonkotsu-ramen' },
  { path: './images/miso-ramen.jpg', publicId: 'menu/miso-ramen' },
  { path: './images/shoyu-ramen.jpg', publicId: 'menu/shoyu-ramen' },
  { path: './images/spicy-miso-ramen.jpg', publicId: 'menu/spicy-miso-ramen' },
  { path: './images/mochi-ice-cream.jpg', publicId: 'menu/mochi-ice-cream' },
  { path: './images/dorayaki.jpg', publicId: 'menu/dorayaki' },
  { path: './images/matcha-cheesecake.jpg', publicId: 'menu/matcha-cheesecake' }
];

async function uploadImages() {
  console.log('Starting image upload to Cloudinary...');
  
  for (const image of imagesToUpload) {
    try {
      console.log(`Uploading ${image.path}...`);
      
      const result = await cloudinary.uploader.upload(image.path, {
        public_id: image.publicId,
        folder: 'menu',
        overwrite: true,
        resource_type: 'image'
      });
      
      console.log(`✅ Successfully uploaded: ${image.publicId}`);
      console.log(`   URL: ${result.secure_url}`);
      
    } catch (error) {
      console.error(`❌ Failed to upload ${image.path}:`, error.message);
    }
  }
  
  console.log('Upload process completed!');
}

// Run the upload
uploadImages().catch(console.error); 
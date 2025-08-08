# Cloudinary Setup Guide

## 1. Create a Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Get your credentials from the dashboard

## 2. Update Environment Variables
Update your `.env` file with your Cloudinary credentials:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 3. Upload Menu Images
You can upload images to Cloudinary in several ways:

### Option A: Upload via Cloudinary Dashboard
1. Go to your Cloudinary Media Library
2. Create a folder called "menu"
3. Upload your food images with descriptive names like:
   - `edamame.jpg`
   - `gyoza.jpg`
   - `salmon-nigiri.jpg`
   - etc.

### Option B: Use the Upload API
You can use the `uploadImageToCloudinary` function in `lib/cloudinary-utils.ts`

## 4. Update Image URLs
Once you have your images uploaded, update the `image` URLs in `scripts/seed-menu.js`:

```javascript
// Replace the demo URLs with your actual Cloudinary URLs
image: "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w_300,h_300,c_fill,q_auto/menu/edamame"
```

## 5. Run the Seed Script
```bash
node scripts/seed-menu.js
```

## 6. Test Your Images
Refresh your application and check that the images are loading correctly.

## Current Demo Setup
The current setup uses Cloudinary's demo account with placeholder images. To use your own images:

1. Replace `demo` with your cloud name in the image URLs
2. Upload your actual food images to Cloudinary
3. Update the image paths in the seed script
4. Re-run the seed script

## Image Optimization
The current setup includes Cloudinary transformations:
- `w_300,h_300`: Resize to 300x300 pixels
- `c_fill`: Crop to fill the dimensions
- `q_auto`: Automatic quality optimization

You can modify these transformations in the image URLs or use the `getCloudinaryUrl` utility function. 
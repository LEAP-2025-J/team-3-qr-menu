# How to Upload Images to Cloudinary

## Method 1: Using the Web Interface (Recommended)

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Go to the upload page:**
   - Visit: `http://localhost:3001/upload`
   - This provides a simple web interface for uploading images

3. **Set up Cloudinary Upload Preset:**
   - Go to your Cloudinary Dashboard
   - Navigate to Settings → Upload
   - Create a new upload preset called `menu_images`
   - Set it to "Unsigned" for client-side uploads

4. **Upload your images:**
   - Select multiple image files
   - Click upload
   - Copy the public IDs that appear

## Method 2: Using the Script

1. **Prepare your images:**
   - Create a folder called `images` in your project
   - Add your food images with descriptive names:
     ```
     images/
     ├── edamame.jpg
     ├── gyoza.jpg
     ├── salmon-nigiri.jpg
     ├── chicken-teriyaki.jpg
     └── ... (other menu items)
     ```

2. **Update the script paths:**
   - Edit `scripts/upload-images.js`
   - Update the `imagesToUpload` array with your actual file paths

3. **Run the upload script:**
   ```bash
   node scripts/upload-images.js
   ```

## Method 3: Manual Upload via Dashboard

1. **Go to Cloudinary Dashboard:**
   - Visit [cloudinary.com](https://cloudinary.com)
   - Sign in to your account

2. **Create a folder:**
   - In Media Library, create a folder called `menu`

3. **Upload images:**
   - Click "Upload" button
   - Drag and drop your images
   - Name them descriptively (e.g., `edamame`, `gyoza`, etc.)

4. **Get the public IDs:**
   - After upload, note the public ID of each image
   - Format: `menu/edamame`, `menu/gyoza`, etc.

## After Uploading: Update Your Application

1. **Update the seed script:**
   - Edit `scripts/seed-menu.js`
   - Replace the demo URLs with your actual Cloudinary URLs:
   ```javascript
   image: "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w_300,h_300,c_fill,q_auto/menu/edamame"
   ```

2. **Re-run the seed script:**
   ```bash
   node scripts/seed-menu.js
   ```

3. **Test your application:**
   - Refresh your menu page
   - Verify images are loading correctly

## Image Requirements

- **Format:** JPG, PNG, or WebP
- **Size:** Recommended 800x600px or larger
- **Quality:** High quality for best results
- **Naming:** Use descriptive names (e.g., `edamame`, `gyoza`)

## Troubleshooting

### Images not loading?
- Check that your Cloudinary credentials are correct in `.env`
- Verify the public IDs match exactly
- Ensure images are uploaded to the correct folder

### Upload errors?
- Make sure your upload preset is configured correctly
- Check that your Cloudinary account has upload permissions
- Verify your API key and secret are correct

### Need to update existing images?
- Upload with the same public ID to overwrite
- Or delete the old image first, then upload new one

## Quick Test

To test if your setup is working:

1. Upload one test image
2. Update one menu item in the seed script
3. Re-run the seed script
4. Check if the image appears on your menu

This will help you verify everything is configured correctly before uploading all your images. 
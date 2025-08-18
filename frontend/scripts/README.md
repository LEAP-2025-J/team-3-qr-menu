# Scripts Directory

This folder contains essential scripts for managing your QR menu application.

## 🚀 Essential Scripts

### 1. `seed-menu.js` - Database Initialization
**Purpose:** Creates initial menu items, categories, and tables in your database
**Usage:** `node scripts/seed-menu.js`
**When to use:** First time setup, or when you want to reset your database

### 2. `connect-cloudinary-images.js` - Image Connection
**Purpose:** Links Cloudinary food photos to menu items in your database
**Usage:** `node scripts/connect-cloudinary-images.js`
**When to use:** After uploading new images to Cloudinary, or when images aren't showing

### 3. `assign-categories.js` - Category Assignment
**Purpose:** Assigns proper categories to menu items based on their names
**Usage:** `node scripts/assign-categories.js`
**When to use:** After seeding menu items, or when categories are missing

### 4. `clean-database.js` - Data Cleanup
**Purpose:** Removes corrupted or invalid menu items from the database
**Usage:** `node scripts/clean-database.js`
**When to use:** When you see invalid menu items (like "q", "t", "r", "y")

### 5. `fix-broken-orders.js` - Order Repair
**Purpose:** Fixes orders with missing menu item references
**Usage:** `node scripts/fix-broken-orders.js`
**When to use:** When you see "Cannot read properties of null" errors in admin panel

### 6. `check-cloudinary-images.js` - Image Verification
**Purpose:** Lists all available images in your Cloudinary account
**Usage:** `node scripts/check-cloudinary-images.js`
**When to use:** To see what food photos you have available

## 📋 Typical Workflow

1. **First time setup:**
   ```bash
   node scripts/seed-menu.js
   node scripts/assign-categories.js
   node scripts/connect-cloudinary-images.js
   ```

2. **When adding new images:**
   ```bash
   node scripts/connect-cloudinary-images.js
   ```

3. **When experiencing issues:**
   ```bash
   node scripts/check-cloudinary-images.js
   node scripts/clean-database.js
   node scripts/fix-broken-orders.js
   ```

## ⚠️ Important Notes

- Always run scripts from the `frontend` directory
- Make sure your `.env` file is properly configured
- These scripts modify your database - use with caution
- Backup your data before running cleanup scripts

## 🔧 Troubleshooting

If a script fails:
1. Check your `.env` file configuration
2. Ensure MongoDB is running
3. Verify Cloudinary credentials
4. Check the console for specific error messages 
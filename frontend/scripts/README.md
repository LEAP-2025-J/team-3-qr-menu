# Database Scripts

This directory contains various database management and migration scripts.

## Available Scripts

### 1. `add-japanese-categories.ts`
**Purpose**: Adds Japanese names to existing categories in the database.

**Usage**:
```bash
cd frontend/scripts
npm run ts-node add-japanese-categories.ts
```

**What it does**:
- Connects to MongoDB using MONGODB_URI from .env
- Updates existing categories with Japanese names (nameJa field)
- Provides detailed logging of the migration process
- Verifies the updates were successful

**Categories updated**:
- appetizers → 前菜
- sushi → 寿司  
- mains → メインディッシュ
- ramen → ラーメン
- desserts → デザート
- drinks → ドリンク

### 2. `seed-menu.ts`
**Purpose**: Seeds the database with initial menu data including categories and menu items.

**Usage**:
```bash
cd frontend/scripts
npm run ts-node seed-menu.ts
```

### 3. `assign-categories.ts`
**Purpose**: Assigns categories to existing menu items.

**Usage**:
```bash
cd frontend/scripts
npm run ts-node assign-categories.ts
```

### 4. `clean-database.ts`
**Purpose**: Cleans up old orders and data.

**Usage**:
```bash
cd frontend/scripts
npm run ts-node clean-database.ts
```

### 5. `fix-broken-orders.ts`
**Purpose**: Fixes orders with missing or invalid data.

**Usage**:
```bash
cd frontend/scripts
npm run ts-node fix-broken-orders.ts
```

### 6. `check-cloudinary-images.ts`
**Purpose**: Checks and validates Cloudinary image URLs.

**Usage**:
```bash
cd frontend/scripts
npm run ts-node check-cloudinary-images.ts
```

### 7. `connect-cloudinary-images.ts`
**Purpose**: Connects Cloudinary images to menu items.

**Usage**:
```bash
cd frontend/scripts
npm run ts-node connect-cloudinary-images.ts
```

## Environment Setup

Make sure you have a `.env` file in the `frontend` directory with:
```
MONGODB_URI=your_mongodb_connection_string
```

## Running Scripts

All scripts use TypeScript and require the following setup:

1. Install dependencies:
```bash
npm install
```

2. Run any script:
```bash
npm run ts-node script-name.ts
```

## Migration Order

When setting up a new database or updating existing data:

1. **First**: Run `seed-menu.ts` to create categories and menu items
2. **Then**: Run `add-japanese-categories.ts` to add Japanese names
3. **Finally**: Run `assign-categories.ts` to link menu items to categories

## Notes

- All scripts include error handling and detailed logging
- Scripts are designed to be idempotent (safe to run multiple times)
- Always backup your database before running migration scripts
- The Japanese categories migration will not affect existing admin functionality 
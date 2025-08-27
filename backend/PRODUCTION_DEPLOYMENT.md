# 🚀 Haku Restaurant Production Deployment Guide

## 📋 **Prerequisites**
- MongoDB Atlas account (or your MongoDB instance)
- Vercel/Heroku account (or your preferred hosting platform)
- Domain name (optional but recommended)

## 🔧 **Step 1: Update Environment Variables**

### **Backend (.env file)**
```bash
# Update these values in backend/.env
JWT_SECRET=haku-restaurant-super-secure-jwt-secret-key-2024-production
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
PORT=5000
```

### **Frontend (.env.local file)**
```bash
# Update these values in frontend/.env.local
NEXT_PUBLIC_PRODUCTION_BACKEND_URL=https://your-backend-domain.com
NEXT_PUBLIC_PRODUCTION_FRONTEND_URL=https://your-frontend-domain.com
```

## 🌐 **Step 2: Deploy Backend**

### **Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel --prod
```

### **Option B: Heroku**
```bash
# Install Heroku CLI
npm i -g heroku

# Deploy backend
cd backend
heroku create your-backend-app
git push heroku main
```

## 🎨 **Step 3: Deploy Frontend**

### **Option A: Vercel**
```bash
cd frontend
vercel --prod
```

### **Option B: Netlify**
```bash
cd frontend
npm run build
# Upload dist folder to Netlify
```

## 🌱 **Step 4: Seed Production Database**

After your backend is deployed and running:

```bash
# Option 1: Run the production seed script
cd backend
node seed-production.js

# Option 2: Use the existing seed script
npm run build
node dist/scripts/seed-users.js
```

## 🔑 **Your Production Login Credentials**

After seeding the database:
- **Admin**: `admin` / `admin123`
- **User**: `user` / `user123`

## ✅ **What This Fixes**

1. ✅ **Removes mock data** - Uses real database
2. ✅ **Creates production users** - Seed script adds real accounts
3. ✅ **Secure JWT tokens** - Production secret key
4. ✅ **Environment-specific URLs** - Frontend connects to production backend
5. ✅ **Database persistence** - Users exist in production MongoDB

## 🧪 **Testing Production**

1. **Test Backend**: Visit your backend URL + `/api/health`
2. **Test Frontend**: Visit your frontend URL
3. **Test Login**: Use the credentials above
4. **Test Admin**: Access `/admin` page
5. **Test User**: Access `/user` page

## 🚨 **Important Notes**

- **Never commit .env files** to version control
- **Use strong JWT secrets** in production
- **Enable HTTPS** for all production URLs
- **Monitor your MongoDB** connection and usage
- **Set up proper logging** for production debugging

## 🆘 **Troubleshooting**

### **"Invalid credentials" error**
- Check if users were seeded in production database
- Verify MongoDB connection string
- Check JWT secret is set correctly

### **"Cannot connect to database" error**
- Verify MongoDB URI is correct
- Check if MongoDB Atlas IP whitelist includes your hosting platform
- Ensure database user has proper permissions

### **Frontend can't connect to backend**
- Verify backend URL in frontend environment variables
- Check CORS settings in backend
- Ensure both frontend and backend are deployed

## 🎯 **Success Checklist**

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database seeded with users
- [ ] Login working with production credentials
- [ ] Admin dashboard accessible
- [ ] User dashboard accessible
- [ ] All API endpoints responding

## 🚀 **You're Ready for Production!**

After completing these steps, your sign-in system will work perfectly in production! 🎉

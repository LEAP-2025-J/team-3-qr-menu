# 🚀 Clerk Authentication Setup Guide

## 📋 **Step 1: Create Clerk Account**

1. Go to [https://clerk.com](https://clerk.com)
2. Click "Get Started" and create a free account
3. Verify your email address

## 🔑 **Step 2: Create New Application**

1. In Clerk Dashboard, click "Add Application"
2. Choose "Next.js" as your framework
3. Give your app a name (e.g., "Haku QR Menu")
4. Click "Create Application"

## ⚙️ **Step 3: Get API Keys**

1. In your app dashboard, go to **API Keys** section
2. Copy these two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

## 📝 **Step 4: Update Environment Variables**

Create or update your `.env.local` file in the `frontend` folder:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin
```

## 🌐 **Step 5: Configure Clerk Settings**

1. In Clerk Dashboard, go to **User & Authentication**
2. Under **Email, Phone, Username**, enable:
   - ✅ **Email address**
   - ✅ **Username**
   - ✅ **First name**
   - ✅ **Last name**

3. Under **Social Connections**, you can enable:
   - Google (recommended)
   - GitHub
   - Other providers

## 🔒 **Step 6: Configure Sign-up Settings**

1. Go to **User & Authentication** → **Sign-up**
2. Enable **Allow sign-ups**
3. Set **Required fields**:
   - ✅ **Email address**
   - ✅ **Username**
   - ✅ **First name**
   - ✅ **Last name**

## 🎨 **Step 7: Customize Appearance (Optional)**

1. Go to **Appearance** in Clerk Dashboard
2. Customize colors, fonts, and branding
3. Upload your restaurant logo

## 🚀 **Step 8: Test Your Setup**

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit `/sign-up` to create an account
3. Visit `/sign-in` to sign in
4. Visit `/admin` (should redirect to sign-in if not authenticated)

## 🔧 **Troubleshooting**

### **Build Errors:**
- Make sure `.env.local` is in the `frontend` folder
- Verify API keys are correct
- Restart the development server after adding environment variables

### **Authentication Issues:**
- Check browser console for errors
- Verify Clerk dashboard settings
- Ensure environment variables are loaded

### **Route Protection:**
- Check `middleware.ts` configuration
- Verify public routes are correctly set

## 📱 **Features You Now Have:**

✅ **Professional Sign-up/Sign-in UI**
✅ **Email verification**
✅ **Password reset**
✅ **Social login (if configured)**
✅ **Route protection**
✅ **User management**
✅ **Session management**
✅ **Secure authentication**

## 🎯 **Next Steps:**

1. **Test the authentication flow**
2. **Customize the UI appearance**
3. **Add user roles and permissions**
4. **Integrate with your backend API**

## 📞 **Need Help?**

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Discord](https://discord.gg/clerk)
- [Clerk Support](https://clerk.com/support)

---

**🎉 Congratulations! You now have a professional authentication system!**

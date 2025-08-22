# 🚨 CRITICAL: Fix Clerk Domain Configuration

## ❌ **The Problem**
Clerk is not working because `localhost:3000` is not configured as an allowed domain in your Clerk dashboard.

## ✅ **Immediate Fix Steps**

### **Step 1: Go to Clerk Dashboard**
1. Visit [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign in to your account
3. Select your "Haku QR Menu" application

### **Step 2: Configure Allowed Domains**
1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Add: `localhost:3000`
4. Click **Save**

### **Step 3: Configure Development Settings**
1. Go to **Settings** → **General**
2. Under **Development**, ensure:
   - ✅ **Allow localhost** is enabled
   - ✅ **Development mode** is active

### **Step 4: Check API Keys**
1. Go to **API Keys**
2. Verify your keys match `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c29jaWFsLWdvYmxpbi0zLmNsZXJrLmFjY291bnRzLmRldiQ
   CLERK_SECRET_KEY=sk_test_c0ItX5jyzIABLJHbFgumwjXh8zOEb6YWKPLcqwBcfj
   ```

### **Step 5: Restart Server**
```bash
# Stop server (Ctrl+C)
npm run dev
```

## 🧪 **Test It**
1. Visit `/simple-test` - Should show "Signed Out" message
2. Visit `/sign-up` - Should show signup form
3. Create account - Should redirect to `/admin`
4. Visit `/admin` - Should show admin dashboard

## 🔍 **Why This Happens**
- Clerk blocks requests from unauthorized domains
- `localhost:3000` is not in the allowed domains list
- This causes all Clerk components to fail silently
- Pages fall back to `not-found.tsx`

## 🆘 **If Still Not Working**
Check browser console (F12) for errors:
- Network tab: Look for failed requests to Clerk
- Console tab: Look for JavaScript errors
- Check if Clerk script is loading properly

**This domain configuration is the most common cause of Clerk not working!**

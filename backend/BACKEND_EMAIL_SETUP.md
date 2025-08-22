# Backend Email Setup for Password Reset

## 🔧 **Setup Instructions:**

### 1. **Create Environment File**
Create a `.env` file in your backend directory:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/restaurant_db

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Gmail Configuration for Password Reset
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# JWT Secret (if using JWT authentication)
JWT_SECRET=your-super-secret-jwt-key
```

### 2. **Gmail App Password Setup**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled
3. Click on "App passwords" (under 2-Step Verification)
4. Select "Mail" as the app
5. Click "Generate"
6. Copy the 16-character password

### 3. **Update Environment Variables**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `your-16-char-app-password` with the app password from step 2

### 4. **Test the Setup**
1. Start your backend server: `npm run dev`
2. Test the forgot password endpoint:
   ```bash
   curl -X POST http://localhost:5000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@restaurant.com",
       "username": "admin",
       "resetToken": "test123",
       "resetLink": "http://localhost:3000/reset-password?token=test123"
     }'
   ```

## 🚀 **API Endpoints:**

### **POST /api/auth/forgot-password**
- **Purpose**: Send password reset email
- **Body**: `{ email, username, resetToken, resetLink }`
- **Response**: `{ success: true, message, messageId }`

### **POST /api/auth/reset-password**
- **Purpose**: Reset password with token
- **Body**: `{ token, newPassword }`
- **Response**: `{ success: true, message }`

## 🔒 **Security Features:**

- **Token Expiration**: Reset tokens expire after 1 hour
- **One-time Use**: Tokens are deleted after use
- **Email Validation**: Only registered emails can request resets
- **Password Hashing**: New passwords are securely hashed

## 🧪 **Testing Flow:**

1. **Frontend**: User clicks "Forgot your password?"
2. **Frontend**: Sends request to `/api/auth/forgot-password`
3. **Backend**: Validates email and sends Gmail
4. **User**: Receives email with reset link
5. **Frontend**: User clicks link and resets password
6. **Frontend**: Sends request to `/api/auth/reset-password`
7. **Backend**: Validates token and updates password

## ⚠️ **Important Notes:**

- **Never commit .env files** to version control
- **Use app passwords**, not regular Gmail passwords
- **Test thoroughly** before deploying to production
- **Monitor email delivery** and spam folder placement

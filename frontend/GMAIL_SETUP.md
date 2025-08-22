# Gmail Setup for Password Reset

## 🔧 **Setup Instructions:**

### 1. **Enable 2-Factor Authentication**
- Go to [Google Account Security](https://myaccount.google.com/security)
- Enable "2-Step Verification" if not already enabled

### 2. **Generate App Password**
- Go to [Google Account Security](https://myaccount.google.com/security)
- Click on "App passwords" (under 2-Step Verification)
- Select "Mail" as the app
- Click "Generate"
- Copy the 16-character password

### 3. **Create Environment File**
Create a `.env.local` file in your frontend directory:

```bash
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. **Replace Placeholder Values**
- `your-email@gmail.com` → Your actual Gmail address
- `your-16-char-app-password` → The app password from step 2

## ⚠️ **Important Security Notes:**

- **Never use your regular Gmail password**
- **App passwords are more secure than regular passwords**
- **Keep your .env.local file private (don't commit to git)**
- **Each app password is unique and can be revoked**

## 🧪 **Testing:**

1. Start your development server
2. Go to `/sign-in`
3. Click "Forgot your password?"
4. Enter `admin@restaurant.com`
5. Check your Gmail for the reset email
6. Click the reset link in the email

## 🚀 **Production Deployment:**

For production, update the environment variables:
- `FRONTEND_URL` → Your actual domain
- Ensure Gmail credentials are set in your hosting platform

## 🔍 **Troubleshooting:**

- **Email not received**: Check spam folder
- **Authentication failed**: Verify app password is correct
- **Gmail blocked**: Check if "Less secure app access" is enabled (not recommended)

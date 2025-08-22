import { Request, Response } from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-email@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
  }
});

// Email template for password reset
const createPasswordResetEmail = (resetLink: string, username: string) => ({
  subject: 'Password Reset Request - Restaurant Admin',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Password Reset</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Restaurant Management System</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hello ${username}!</h2>
        
        <p style="color: #666; line-height: 1.6;">
          We received a request to reset your password for the Restaurant Admin Dashboard.
          If you didn't make this request, you can safely ignore this email.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          This link will expire in 1 hour for security reasons.
        </p>
        
        <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #495057; font-size: 14px;">
            <strong>Security Note:</strong> Never share this email or click the link if you didn't request a password reset.
          </p>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          If you have any questions, please contact our support team.
        </p>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    </div>
  `
});

// Store users in memory (in a real app, this would be a database)
const users = new Map<string, {
  username: string;
  email: string;
  password: string;
  restaurantName: string;
  phoneNumber: string;
}>();

// Add default admin user only
users.set('admin', {
  username: 'admin',
  email: 'admin@restaurant.com',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "admin123"
  restaurantName: 'Default Restaurant',
  phoneNumber: '1234567890'
});

// Clear all reset tokens
const resetTokens = new Map<string, { email: string; username: string; expires: number }>();

// Function to clear all accounts and reset to default state
export const clearAllAccounts = async (req: Request, res: Response) => {
  try {
    // Clear all users except admin
    const adminUser = users.get('admin');
    users.clear();
    
    // Restore only the default admin user
    if (adminUser) {
      users.set('admin', adminUser);
    }
    
    // Clear all reset tokens
    resetTokens.clear();
    
    console.log('All accounts cleared, reset to default admin only');
    
    res.json({
      success: true,
      message: "All accounts cleared successfully",
      remainingUsers: Array.from(users.keys())
    });
    
  } catch (error) {
    console.error('Error clearing accounts:', error);
    res.status(500).json({
      success: false,
      message: "Failed to clear accounts",
      error: error.message
    });
  }
};

// Function to list all current users (for debugging)
export const listUsers = async (req: Request, res: Response) => {
  try {
    const userList = Array.from(users.values()).map(user => ({
      username: user.username,
      email: user.email,
      restaurantName: user.restaurantName
    }));
    
    res.json({
      success: true,
      message: "Users retrieved successfully",
      users: userList,
      totalUsers: userList.length
    });
    
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({
      success: false,
      message: "Failed to list users",
      error: error.message
    });
  }
};

// User registration
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, restaurantName, phoneNumber } = req.body;

    // Validate input
    if (!username || !email || !password || !restaurantName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if username already exists
    if (users.has(username)) {
      return res.status(400).json({
        success: false,
        message: "Username already exists"
      });
    }

    // Check if email already exists
    const existingUser = Array.from(users.values()).find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      restaurantName,
      phoneNumber
    };

    // Store user
    users.set(username, newUser);

    console.log('New user registered:', { username, email, restaurantName });

    res.json({
      success: true,
      message: "User registered successfully",
      user: {
        username: newUser.username,
        email: newUser.email,
        restaurantName: newUser.restaurantName
      }
    });

  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message
    });
  }
};

// User login
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    // Find user
    const user = users.get(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    console.log('User logged in:', username);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        username: user.username,
        email: user.email,
        restaurantName: user.restaurantName
      }
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      message: "Failed to login",
      error: error.message
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, username, resetToken, resetLink } = req.body;

    // Validate input
    if (!email || !username || !resetToken || !resetLink) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Check if email exists in users
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found in our system. Please check your email address or contact support."
      });
    }

    // Verify username matches the email
    if (user.username !== username) {
      return res.status(400).json({
        success: false,
        message: "Username does not match the email address"
      });
    }

    // Store reset token with expiration (1 hour)
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour
    resetTokens.set(resetToken, {
      email,
      username,
      expires
    });

    // Check if Gmail credentials are configured
    const hasGmailConfig = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
    
    if (!hasGmailConfig) {
      // Test mode - return success without sending email
      console.log('TEST MODE: Password reset requested for:', email);
      console.log('Reset link:', resetLink);
      console.log('Gmail not configured - email would be sent in production');
      
      return res.json({
        success: true,
        message: "Password reset token generated successfully (TEST MODE - Gmail not configured)",
        resetToken: resetToken,
        resetLink: resetLink,
        testMode: true
      });
    }

    // Create email content
    const emailContent = createPasswordResetEmail(resetLink, username);

    // Send email
    const mailOptions = {
      from: process.env.GMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);

    console.log('Password reset email sent successfully:', result.messageId);

    res.json({
      success: true,
      message: "Password reset email sent successfully",
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: "Failed to send password reset email",
      error: error.message
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Check if token exists and is valid
    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Check if token has expired
    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      return res.status(400).json({
        success: false,
        message: "Reset token has expired"
      });
    }

    // Find user by email
    const user = Array.from(users.values()).find(u => u.email === tokenData.email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;

    console.log('Password reset for user:', user.username);

    // Remove the used token
    resetTokens.delete(token);

    res.json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message
    });
  }
};

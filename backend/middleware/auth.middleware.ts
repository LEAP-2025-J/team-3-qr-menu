import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Request interface to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        role: string;
      };
    }
  }
}

// Middleware to verify JWT token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: "Access token required" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
    
    // Add user info to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ 
        success: false, 
        error: "Invalid token" 
      });
    }
    
    console.error("Authentication error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Authentication failed" 
    });
  }
};

// Middleware to check if user has required role
export const requireRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication required" 
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        success: false, 
        error: "Insufficient permissions" 
      });
    }

    next();
  };
};

// Middleware to check if user has admin role
export const requireAdmin = requireRole("admin");

// Middleware to check if user has user role
export const requireUser = requireRole("user");

// Middleware to check if user has either admin or user role
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      error: "Authentication required" 
    });
  }

  if (req.user.role !== "admin" && req.user.role !== "user") {
    return res.status(403).json({ 
      success: false, 
      error: "Invalid user role" 
    });
  }

  next();
};

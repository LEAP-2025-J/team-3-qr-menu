import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/model.user.js";

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    
    res.json({
      success: true,
      data: user,
      message: "User retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
    });
  }
};

// Create new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      photo,
      registerId,
      phoneNumber,
      address,
      username,
      password,
      role,
      email,
    } = req.body;

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: "Username already exists",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    // Check if register ID already exists
    const existingRegisterId = await User.findOne({ registerId });
    if (existingRegisterId) {
      return res.status(400).json({
        success: false,
        error: "Register ID already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      photo,
      registerId,
      phoneNumber,
      address,
      username,
      password: hashedPassword,
      role: role || "user",
      email,
    });

    const savedUser = await newUser.save();
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: userResponse,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to create user",
    });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove password from update data if it's not being changed
    if (!updateData.password) {
      delete updateData.password;
    } else {
      // Hash new password if it's being updated
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    // Check for unique constraints if updating username, email, or registerId
    if (updateData.username) {
      const existingUsername = await User.findOne({ username: updateData.username, _id: { $ne: id } });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          error: "Username already exists",
        });
      }
    }

    if (updateData.email) {
      const existingEmail = await User.findOne({ email: updateData.email, _id: { $ne: id } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: "Email already exists",
        });
      }
    }

    if (updateData.registerId) {
      const existingRegisterId = await User.findOne({ registerId: updateData.registerId, _id: { $ne: id } });
      if (existingRegisterId) {
        return res.status(400).json({
          success: false,
          error: "Register ID already exists",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to update user",
    });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Prevent deletion of the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: "Cannot delete the last admin user",
        });
      }
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Prevent deactivating the last admin
    if (user.role === "admin" && !user.isActive) {
      const activeAdminCount = await User.countDocuments({ role: "admin", isActive: true });
      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: "Cannot deactivate the last active admin user",
        });
      }
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      data: { isActive: user.isActive },
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to toggle user status",
    });
  }
};

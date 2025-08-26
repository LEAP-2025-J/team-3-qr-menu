import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../controllers/user.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// All user routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// GET /api/users - Get all users
router.get("/", getAllUsers);

// GET /api/users/:id - Get user by ID
router.get("/:id", getUserById);

// POST /api/users - Create new user
router.post("/", createUser);

// PUT /api/users/:id - Update user
router.put("/:id", updateUser);

// DELETE /api/users/:id - Delete user
router.delete("/:id", deleteUser);

// PATCH /api/users/:id/toggle-status - Toggle user active status
router.patch("/:id/toggle-status", toggleUserStatus);

export default router;

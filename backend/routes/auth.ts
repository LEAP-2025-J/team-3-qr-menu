import express from "express";
import { signup, login, forgotPassword, resetPassword, clearAllAccounts, listUsers } from "../controllers/auth.controller.js";

const router = express.Router();

// User registration route
router.post("/signup", signup);

// User login route
router.post("/login", login);

// Forgot password route
router.post("/forgot-password", forgotPassword);

// Reset password route
router.post("/reset-password", resetPassword);

// Clear all accounts route (for admin use)
router.post("/clear-all-accounts", clearAllAccounts);

// List all users route (for debugging)
router.get("/users", listUsers);

export default router;

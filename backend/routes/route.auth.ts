import express from "express";
import { login, verifyToken, logout } from "../controllers/auth.controller.js";

const router = express.Router();

// POST /api/auth/login - User login
router.post("/login", login);

// POST /api/auth/logout - User logout
router.post("/logout", logout);

// GET /api/auth/verify - Verify JWT token
router.get("/verify", verifyToken);

export default router;

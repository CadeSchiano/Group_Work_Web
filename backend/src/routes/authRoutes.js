import { Router } from "express";
import {
  changePassword,
  login,
  logout,
  me,
  requestPasswordReset,
  resetPassword,
  signup,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { rateLimit } from "../middleware/rateLimitMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, key: "auth" });
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, key: "password-reset" });

router.post("/signup", authLimiter, asyncHandler(signup));
router.post("/login", authLimiter, asyncHandler(login));
router.post("/request-password-reset", resetLimiter, asyncHandler(requestPasswordReset));
router.post("/reset-password", resetLimiter, asyncHandler(resetPassword));
router.post("/change-password", requireAuth, authLimiter, asyncHandler(changePassword));
router.post("/logout", asyncHandler(logout));
router.get("/me", requireAuth, asyncHandler(me));

export default router;

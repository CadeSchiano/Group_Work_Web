import { Router } from "express";
import { login, me, recoverPassword, signup } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));
router.post("/recover-password", asyncHandler(recoverPassword));
router.get("/me", requireAuth, asyncHandler(me));

export default router;

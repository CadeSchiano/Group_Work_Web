import { Router } from "express";
import authRoutes from "./authRoutes.js";
import groupRoutes from "./groupRoutes.js";
import taskRoutes from "./taskRoutes.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/groups", requireAuth, groupRoutes);
router.use("/tasks", requireAuth, taskRoutes);

export default router;

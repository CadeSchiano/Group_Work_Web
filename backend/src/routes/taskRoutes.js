import { Router } from "express";
import { updateTask } from "../controllers/taskController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.patch("/:taskId", asyncHandler(updateTask));

export default router;

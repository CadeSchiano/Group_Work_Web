import { Router } from "express";
import {
  createGroup,
  getGroupDetails,
  joinGroup,
  listGroups,
  removeGroupMember,
} from "../controllers/groupController.js";
import { createTask, listTasks } from "../controllers/taskController.js";
import { deleteFile, listFiles, uploadFile } from "../controllers/fileController.js";
import { createRoadmapItem, listRoadmapItems } from "../controllers/roadmapController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listGroups));
router.post("/", asyncHandler(createGroup));
router.post("/join", asyncHandler(joinGroup));
router.get("/:groupId", asyncHandler(getGroupDetails));
router.get("/:groupId/tasks", asyncHandler(listTasks));
router.post("/:groupId/tasks", asyncHandler(createTask));
router.get("/:groupId/files", asyncHandler(listFiles));
router.post("/:groupId/files", upload.single("file"), asyncHandler(uploadFile));
router.delete("/:groupId/files/:fileId", asyncHandler(deleteFile));
router.get("/:groupId/roadmap", asyncHandler(listRoadmapItems));
router.post("/:groupId/roadmap", asyncHandler(createRoadmapItem));
router.delete("/:groupId/members/:memberId", asyncHandler(removeGroupMember));

export default router;

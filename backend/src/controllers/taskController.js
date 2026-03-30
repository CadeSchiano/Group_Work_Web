import { prisma } from "../config/prisma.js";

const validStatuses = new Set(["TODO", "IN_PROGRESS", "DONE"]);

const ensureMembership = async (groupId, userId) =>
  prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

const parseOptionalDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const validateAssignee = async (groupId, assignedUserId) => {
  if (!assignedUserId) {
    return null;
  }

  const assigneeMembership = await ensureMembership(groupId, assignedUserId);
  return assigneeMembership ? assignedUserId : false;
};

export const listTasks = async (req, res) => {
  const { groupId } = req.params;

  const membership = await ensureMembership(groupId, req.user.id);
  if (!membership) {
    return res.status(403).json({ message: "You do not have access to this group." });
  }

  const tasks = await prisma.task.findMany({
    where: { groupId },
    include: {
      assignedUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ tasks });
};

export const createTask = async (req, res) => {
  const title = req.body.title?.trim();
  const description = req.body.description?.trim();
  const assignedUserId = req.body.assignedUserId || null;
  const dueDate = parseOptionalDate(req.body.dueDate);
  const status = req.body.status || "TODO";
  const { groupId } = req.params;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required." });
  }

  if (!validStatuses.has(status)) {
    return res.status(400).json({ message: "Task status is invalid." });
  }

  if (req.body.dueDate && !dueDate) {
    return res.status(400).json({ message: "Due date is invalid." });
  }

  const membership = await ensureMembership(groupId, req.user.id);
  if (!membership) {
    return res.status(403).json({ message: "You do not have access to this group." });
  }

  const validatedAssignee = await validateAssignee(groupId, assignedUserId);
  if (validatedAssignee === false) {
    return res.status(400).json({ message: "Assigned user must be a member of this group." });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      assignedUserId: validatedAssignee,
      dueDate,
      status,
      groupId,
    },
    include: {
      assignedUser: { select: { id: true, name: true, email: true } },
    },
  });

  return res.status(201).json({ task });
};

export const updateTask = async (req, res) => {
  const existingTask = await prisma.task.findUnique({
    where: { id: req.params.taskId },
  });

  if (!existingTask) {
    return res.status(404).json({ message: "Task not found." });
  }

  const membership = await ensureMembership(existingTask.groupId, req.user.id);
  if (!membership) {
    return res.status(403).json({ message: "You do not have access to this task." });
  }

  const title = req.body.title?.trim();
  const description = req.body.description?.trim();
  const assignedUserId = req.body.assignedUserId || null;
  const dueDate = parseOptionalDate(req.body.dueDate);
  const status = req.body.status;

  if (!title || !description || !status) {
    return res.status(400).json({ message: "Title, description, and status are required." });
  }

  if (!validStatuses.has(status)) {
    return res.status(400).json({ message: "Task status is invalid." });
  }

  if (req.body.dueDate && !dueDate) {
    return res.status(400).json({ message: "Due date is invalid." });
  }

  const validatedAssignee = await validateAssignee(existingTask.groupId, assignedUserId);
  if (validatedAssignee === false) {
    return res.status(400).json({ message: "Assigned user must be a member of this group." });
  }

  const task = await prisma.task.update({
    where: { id: req.params.taskId },
    data: {
      title,
      description,
      assignedUserId: validatedAssignee,
      dueDate,
      status,
    },
    include: {
      assignedUser: { select: { id: true, name: true, email: true } },
    },
  });

  return res.json({ task });
};

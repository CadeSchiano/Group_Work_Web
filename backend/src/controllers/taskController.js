import { prisma } from "../config/prisma.js";

const ensureMembership = async (groupId, userId) =>
  prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

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
  const { title, description, assignedUserId, dueDate, status } = req.body;
  const { groupId } = req.params;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required." });
  }

  const membership = await ensureMembership(groupId, req.user.id);
  if (!membership) {
    return res.status(403).json({ message: "You do not have access to this group." });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      assignedUserId: assignedUserId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status || "TODO",
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

  const { title, description, assignedUserId, dueDate, status } = req.body;

  const task = await prisma.task.update({
    where: { id: req.params.taskId },
    data: {
      title,
      description,
      assignedUserId: assignedUserId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status,
    },
    include: {
      assignedUser: { select: { id: true, name: true, email: true } },
    },
  });

  return res.json({ task });
};

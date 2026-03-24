import { prisma } from "../config/prisma.js";

export const listRoadmapItems = async (req, res) => {
  const { groupId } = req.params;

  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: req.user.id,
      },
    },
  });

  if (!membership) {
    return res.status(403).json({ message: "You do not have access to this group." });
  }

  const roadmap = await prisma.roadmapItem.findMany({
    where: { groupId },
    orderBy: { targetDate: "asc" },
  });

  return res.json({ roadmap });
};

export const createRoadmapItem = async (req, res) => {
  const { title, description, targetDate } = req.body;
  const { groupId } = req.params;

  if (!title || !description || !targetDate) {
    return res.status(400).json({ message: "Title, description, and target date are required." });
  }

  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: req.user.id,
      },
    },
  });

  if (!membership) {
    return res.status(403).json({ message: "You do not have access to this group." });
  }

  const milestone = await prisma.roadmapItem.create({
    data: {
      title,
      description,
      targetDate: new Date(targetDate),
      groupId,
    },
  });

  return res.status(201).json({ milestone });
};

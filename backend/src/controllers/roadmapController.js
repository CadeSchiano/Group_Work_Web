import { prisma } from "../config/prisma.js";

const parseTargetDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

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
  const title = req.body.title?.trim();
  const description = req.body.description?.trim();
  const parsedTargetDate = parseTargetDate(req.body.targetDate);
  const { groupId } = req.params;

  if (!title || !description || !req.body.targetDate) {
    return res.status(400).json({ message: "Title, description, and target date are required." });
  }

  if (!parsedTargetDate) {
    return res.status(400).json({ message: "Target date is invalid." });
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
      targetDate: parsedTargetDate,
      groupId,
    },
  });

  return res.status(201).json({ milestone });
};

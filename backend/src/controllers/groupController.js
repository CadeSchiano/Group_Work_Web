import { prisma } from "../config/prisma.js";
import { calculateProgress } from "../utils/serializers.js";
import { generateInviteCode } from "../utils/generateInviteCode.js";

const groupInclude = {
  owner: { select: { id: true, name: true, email: true } },
  members: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
  tasks: {
    include: {
      assignedUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  },
  files: {
    include: {
      uploader: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  },
  roadmap: {
    orderBy: { targetDate: "asc" },
  },
};

const mapGroup = (group) => ({
  ...group,
  progress: calculateProgress(group.tasks),
});

export const listGroups = async (req, res) => {
  const memberships = await prisma.groupMember.findMany({
    where: { userId: req.user.id },
    include: { group: { include: groupInclude } },
    orderBy: { joinedAt: "desc" },
  });

  return res.json({
    groups: memberships.map(({ group }) => mapGroup(group)),
  });
};

export const createGroup = async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: "Name and description are required." });
  }

  const group = await prisma.group.create({
    data: {
      name,
      description,
      inviteCode: generateInviteCode(),
      ownerId: req.user.id,
      members: {
        create: {
          userId: req.user.id,
          role: "owner",
        },
      },
    },
    include: groupInclude,
  });

  return res.status(201).json({ group: mapGroup(group) });
};

export const joinGroup = async (req, res) => {
  const { inviteCode } = req.body;

  if (!inviteCode) {
    return res.status(400).json({ message: "Invite code is required." });
  }

  const group = await prisma.group.findUnique({
    where: { inviteCode: inviteCode.toUpperCase() },
  });

  if (!group) {
    return res.status(404).json({ message: "Group not found for this invite code." });
  }

  await prisma.groupMember.upsert({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId: req.user.id,
      },
    },
    update: {},
    create: {
      groupId: group.id,
      userId: req.user.id,
    },
  });

  const hydratedGroup = await prisma.group.findUnique({
    where: { id: group.id },
    include: groupInclude,
  });

  return res.json({ group: mapGroup(hydratedGroup) });
};

export const getGroupDetails = async (req, res) => {
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: req.params.groupId,
        userId: req.user.id,
      },
    },
  });

  if (!membership) {
    return res.status(403).json({ message: "You do not have access to this group." });
  }

  const group = await prisma.group.findUnique({
    where: { id: req.params.groupId },
    include: groupInclude,
  });

  return res.json({ group: mapGroup(group) });
};

export const removeGroupMember = async (req, res) => {
  const { groupId, memberId } = req.params;

  const currentMembership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: req.user.id,
      },
    },
  });

  if (!currentMembership) {
    return res.status(403).json({ message: "You do not have access to this group." });
  }

  if (currentMembership.role !== "owner") {
    return res.status(403).json({ message: "Only the group owner can remove members." });
  }

  const membershipToRemove = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: memberId,
      },
    },
  });

  if (!membershipToRemove) {
    return res.status(404).json({ message: "Member not found in this group." });
  }

  if (membershipToRemove.role === "owner" || membershipToRemove.userId === req.user.id) {
    return res.status(400).json({ message: "The group owner cannot be removed." });
  }

  await prisma.groupMember.delete({
    where: {
      groupId_userId: {
        groupId,
        userId: memberId,
      },
    },
  });

  await prisma.task.updateMany({
    where: {
      groupId,
      assignedUserId: memberId,
    },
    data: {
      assignedUserId: null,
    },
  });

  return res.json({ message: "Member removed from the group." });
};

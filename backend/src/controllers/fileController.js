import fs from "fs/promises";
import path from "path";
import { prisma } from "../config/prisma.js";

export const listFiles = async (req, res) => {
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

  const files = await prisma.groupFile.findMany({
    where: { groupId },
    include: {
      uploader: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ files });
};

export const uploadFile = async (req, res) => {
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

  if (!req.file) {
    return res.status(400).json({ message: "A file is required." });
  }

  const file = await prisma.groupFile.create({
    data: {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size,
      groupId,
      uploaderId: req.user.id,
    },
    include: {
      uploader: { select: { id: true, name: true } },
    },
  });

  return res.status(201).json({
    file: {
      ...file,
      extension: path.extname(file.originalName),
    },
  });
};

export const deleteFile = async (req, res) => {
  const { groupId, fileId } = req.params;

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

  const file = await prisma.groupFile.findUnique({
    where: { id: fileId },
  });

  if (!file || file.groupId !== groupId) {
    return res.status(404).json({ message: "File not found." });
  }

  if (membership.role !== "owner" && file.uploaderId !== req.user.id) {
    return res.status(403).json({ message: "Only the owner or uploader can remove this file." });
  }

  await prisma.groupFile.delete({
    where: { id: fileId },
  });

  const diskPath = path.resolve("uploads", file.fileName);
  await fs.unlink(diskPath).catch(() => {});

  return res.json({ message: "File removed from the group." });
};

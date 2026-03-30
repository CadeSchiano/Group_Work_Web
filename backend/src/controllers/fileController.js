import fs from "fs/promises";
import path from "path";
import { prisma } from "../config/prisma.js";

const getMembership = (groupId, userId) =>
  prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

const getGroupFile = async (groupId, fileId) => {
  const file = await prisma.groupFile.findUnique({ where: { id: fileId } });
  return file && file.groupId === groupId ? file : null;
};

export const listFiles = async (req, res) => {
  const { groupId } = req.params;

  const membership = await getMembership(groupId, req.user.id);
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

  return res.json({
    files: files.map((file) => ({
      ...file,
      extension: path.extname(file.originalName),
    })),
  });
};

export const uploadFile = async (req, res) => {
  const { groupId } = req.params;

  const membership = await getMembership(groupId, req.user.id);
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

export const downloadFile = async (req, res) => {
  const { groupId, fileId } = req.params;

  const membership = await getMembership(groupId, req.user.id);
  if (!membership) {
    return res.status(403).json({ message: "You do not have access to this group." });
  }

  const file = await getGroupFile(groupId, fileId);
  if (!file) {
    return res.status(404).json({ message: "File not found." });
  }

  const diskPath = path.resolve("uploads", file.fileName);
  await fs.access(diskPath);
  res.setHeader("Content-Type", file.mimeType);
  return res.download(diskPath, file.originalName);
};

export const deleteFile = async (req, res) => {
  const { groupId, fileId } = req.params;

  const membership = await getMembership(groupId, req.user.id);
  if (!membership) {
    return res.status(403).json({ message: "You do not have access to this group." });
  }

  const file = await getGroupFile(groupId, fileId);
  if (!file) {
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

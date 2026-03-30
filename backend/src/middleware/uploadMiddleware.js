import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve("uploads");
const maxFileSize = 10 * 1024 * 1024;
const allowedExtensions = new Set([
  ".pdf",
  ".txt",
  ".md",
  ".csv",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".zip",
]);
const allowedMimeTypes = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
]);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const sanitizeBaseName = (originalName) => {
  const extension = path.extname(originalName).toLowerCase();
  const baseName = path
    .basename(originalName, extension)
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  return {
    baseName: baseName || "file",
    extension,
  };
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const { baseName, extension } = sanitizeBaseName(file.originalname);
    cb(null, `${crypto.randomUUID()}-${baseName}${extension}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const { extension } = sanitizeBaseName(file.originalname);

  if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "file"));
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 1,
  },
});

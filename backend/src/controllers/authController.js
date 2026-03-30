import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/prisma.js";
import { clearAuthCookie, setAuthCookie } from "../utils/cookies.js";
import { signToken } from "../utils/jwt.js";
import { serializeUser } from "../utils/serializers.js";

const minimumPasswordLength = 8;
const resetTokenTtlMs = 1000 * 60 * 60;

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const hashResetToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const validatePassword = (password) => typeof password === "string" && password.length >= minimumPasswordLength;

const issueSession = (res, user) => {
  const token = signToken(user);
  setAuthCookie(res, token);
  return { user: serializeUser(user) };
};

export const signup = async (req, res) => {
  const name = req.body.name?.trim();
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ message: "Passwords must be at least 8 characters long." });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return res.status(201).json(issueSession(res, user));
};

export const login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  return res.json(issueSession(res, user));
};

export const requestPasswordReset = async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  let resetToken;

  if (user) {
    resetToken = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: hashResetToken(resetToken),
        passwordResetExpiresAt: new Date(Date.now() + resetTokenTtlMs),
      },
    });
  }

  return res.json({
    message: "If that email is registered, password reset instructions have been generated.",
    ...(process.env.NODE_ENV === "production" ? {} : { resetToken }),
  });
};

export const resetPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;
  const resetToken = req.body.resetToken?.trim();

  if (!email || !password || !resetToken) {
    return res.status(400).json({ message: "Email, reset token, and new password are required." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ message: "Passwords must be at least 8 characters long." });
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
      passwordResetTokenHash: hashResetToken(resetToken),
      passwordResetExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Reset token is invalid or expired." });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    },
  });

  return res.json({ message: "Password updated. You can log in with the new password now." });
};

export const changePassword = async (req, res) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required." });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({ message: "Passwords must be at least 8 characters long." });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const isMatch = user ? await bcrypt.compare(currentPassword, user.passwordHash) : false;

  if (!isMatch) {
    return res.status(401).json({ message: "Current password is incorrect." });
  }

  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      passwordHash: await bcrypt.hash(newPassword, 12),
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    },
  });

  return res.json({ message: "Password updated successfully." });
};

export const logout = async (_req, res) => {
  clearAuthCookie(res);
  return res.status(204).send();
};

export const me = async (req, res) => res.json({ user: req.user });

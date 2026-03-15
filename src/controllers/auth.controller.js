import bcrypt from "bcrypt";
import prisma from "../prisma.js";
import crypto from "crypto";
import { signToken } from "../utils/jwt.js";

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.active) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email
    }
  });
}

/* =========================
   FORGOT PASSWORD
========================= */
export async function forgotPassword(req, res) {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json({ success: true }); // don't reveal

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 30) // 30 min
    }
  });

  // later: email this token
  res.json({ resetToken: token });
}

/* =========================
   RESET PASSWORD
========================= */
export async function resetPassword(req, res) {
  const { token, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() }
    }
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hash,
      resetToken: null,
      resetTokenExpiry: null
    }
  });

  res.json({ success: true });
}


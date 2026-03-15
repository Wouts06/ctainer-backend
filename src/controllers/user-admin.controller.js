import prisma from "../prisma.js";
import bcrypt from "bcryptjs";

/* =========================
   LIST USERS
========================= */
export async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    include: {
      branch: true
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(users);
}

/* =========================
   CREATE USER
========================= */
export async function createUser(req, res) {
  const { name, email, password, role, branchId } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hash,
      role,
      branchId: branchId || null
    }
  });

  res.json(user);
}

/* =========================
   ACTIVATE / DEACTIVATE
========================= */
export async function updateUserStatus(req, res) {
  const { id } = req.params;
  const { active } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: { active }
  });

  res.json(user);
}

/* =========================
   ADMIN RESET PASSWORD
========================= */
export async function adminResetPassword(req, res) {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "Missing password" });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id },
    data: { password: hash }
  });

  res.json({ success: true });
}

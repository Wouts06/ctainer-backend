import prisma from "../prisma.js";
import bcrypt from "bcrypt";

/* =========================
   LIST USERS
========================= */
export async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    include: { branch: true },
    orderBy: { createdAt: "desc" }
  });

  res.json(users);
}

/* =========================
   CREATE USER
========================= */
export async function createUser(req, res) {
  const { name, email, role, branchId, password } = req.body;

  if (!name || !email || !role || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      password: hash,
      branchId: branchId || null
    }
  });

  res.status(201).json(user);
}

/* =========================
   ACTIVATE / DEACTIVATE
========================= */
export async function toggleActive(req, res) {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const updated = await prisma.user.update({
    where: { id },
    data: { active: !user.active }
  });

  res.json(updated);
}

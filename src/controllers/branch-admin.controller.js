import prisma from "../prisma.js";

/* ===== LIST ===== */
export async function listBranches(req, res) {
  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" }
  });
  res.json(branches);
}

/* ===== CREATE ===== */
export async function createBranch(req, res) {
  const { name } = req.body;

  if (!name) return res.status(400).json({ message: "Name required" });

  try {
    const branch = await prisma.branch.create({
      data: { name }
    });
    res.json(branch);
  } catch (err) {
    res.status(400).json({ message: "Branch already exists" });
  }
}

/* ===== UPDATE ===== */
export async function updateBranch(req, res) {
  const { id } = req.params;
  const { name } = req.body;

  const branch = await prisma.branch.update({
    where: { id },
    data: { name }
  });

  res.json(branch);
}

/* ===== DELETE ===== */
export async function deleteBranch(req, res) {
  const { id } = req.params;

  await prisma.branch.delete({
    where: { id }
  });

  res.json({ success: true });
}

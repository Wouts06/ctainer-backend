import prisma from "../prisma.js";

export async function registerPushToken(req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token required" });
  }

  await prisma.pushToken.upsert({
    where: { token },
    update: {},
    create: {
      token,
      userId: req.user.id,
      branchId: req.user.branchId
    }
  });

  res.json({ success: true });
}
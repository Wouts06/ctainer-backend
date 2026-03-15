import { verifyToken } from "../utils/jwt.js";
import prisma from "../prisma.js";

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
        email: true,
        branchId: true,
        active: true
      }
    });

    if (!user || !user.active) {
      return res.status(401).json({ message: "User not active" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verify failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}

import express from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" }
  });
  res.json(branches);
});

export default router;

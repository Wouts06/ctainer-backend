import express from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const agents = await prisma.agent.findMany({
    orderBy: { name: "asc" }
  });
  res.json(agents);
});

export default router;

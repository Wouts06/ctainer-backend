import express from "express";
import auth from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  getAgents,
  createAgent
} from "../controllers/agent.controller.js";

const router = express.Router();

// ✅ GET all agents
router.get(
  "/",
  auth,
  requireRole(["ADMIN", "OFFICE", "DRIVER"]),
  getAgents
);

// ✅ CREATE agent
router.post(
  "/",
  auth,
  requireRole(["ADMIN"]),
  createAgent
);

export default router;
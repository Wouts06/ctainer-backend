import express from "express";
import auth from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { getAvailableClearanceEvents } from "../controllers/clearance.controller.js";
import { createClearanceEvent } from "../controllers/clearance.controller.js";

const router = express.Router();

/**
 * Driver: available clearance events
 * GET /clearance/available?agentId=xxx
 */
router.get(
  "/available",
  auth,
  requireRole(["DRIVER"]),
  getAvailableClearanceEvents
);

export default router;

router.post(
  "/",
  auth,
  requireRole(["ADMIN", "OFFICE", "DRIVER"]),
  createClearanceEvent
);
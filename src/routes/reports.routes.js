import express from "express";
import auth from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

import {
  dashboardSummary,
  averageClearingTimePerAgent,
  overduePerAgent,
  exportWaybillsAndManifests,
  driverProductivity,
  exceptionRecall,
  partialOpenEvents
} from "../controllers/reports.controller.js";

const router = express.Router();

/* ================= ADMIN REPORTS ================= */

router.get(
  "/partial-events",
  auth,
  requireRole(["ADMIN", "OFFICE"]),
  partialOpenEvents
);

router.get(
  "/average-clearing-time",
  auth,
  requireRole(["ADMIN", "OFFICE"]),
  averageClearingTimePerAgent
);

router.get(
  "/overdue-per-agent",
  auth,
  requireRole(["ADMIN", "OFFICE"]),
  overduePerAgent
);

router.get(
  "/waybills-manifests",
  auth,
  requireRole(["ADMIN", "OFFICE"]),
  exportWaybillsAndManifests
);

router.get(
  "/driver-productivity",
  auth,
  requireRole(["ADMIN", "OFFICE"]),
  driverProductivity
);

router.get(
  "/exceptions",
  auth,
  requireRole(["ADMIN", "OFFICE"]),
  exceptionRecall
);

router.get(
  "/dashboard-summary",
  auth,
  requireRole(["ADMIN", "OFFICE"]),
  dashboardSummary
);

export default router;

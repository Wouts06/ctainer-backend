import express from "express";
import auth from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  clearSuccess,
  clearPartial,
  clearFailed,
  adminCloseSuccess,
  adminCloseFailed,
  adminOverride
} from "../controllers/clearance-actions.controller.js";

const router = express.Router();

router.post("/success", auth, requireRole(["DRIVER"]), clearSuccess);
router.post("/partial", auth, requireRole(["DRIVER"]), clearPartial);
router.post("/fail", auth, requireRole(["DRIVER"]), clearFailed);
router.post("/override", auth, requireRole(["ADMIN"]), adminOverride);

router.post(
  "/admin-close-success",
  auth,
  requireRole(["ADMIN", "OFFICE"]),
  adminCloseSuccess
);

router.post(
  "/admin-close-failed",
  auth,
  requireRole(["ADMIN", "OFFICE"]),
  adminCloseFailed
);


export default router;

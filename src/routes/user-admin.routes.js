import express from "express";
import auth from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  listUsers,
  createUser,
  updateUserStatus,
  adminResetPassword
} from "../controllers/user-admin.controller.js";

const router = express.Router();

// ADMIN only
router.get("/", auth, requireRole(["ADMIN"]), listUsers);

router.post("/", auth, requireRole(["ADMIN"]), createUser);

router.patch(
  "/:id/status",
  auth,
  requireRole(["ADMIN"]),
  updateUserStatus
);

router.post(
  "/:id/reset-password",
  auth,
  requireRole(["ADMIN"]),
  adminResetPassword
);

export default router;

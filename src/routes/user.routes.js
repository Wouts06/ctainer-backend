import express from "express";
import auth from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  listUsers,
  createUser,
  toggleActive
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", auth, requireRole(["ADMIN"]), listUsers);
router.post("/", auth, requireRole(["ADMIN"]), createUser);
router.patch("/:id/toggle", auth, requireRole(["ADMIN"]), toggleActive);

export default router;

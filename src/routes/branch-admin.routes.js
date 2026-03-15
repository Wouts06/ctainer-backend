import express from "express";
import auth from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  listBranches,
  createBranch,
  updateBranch,
  deleteBranch
} from "../controllers/branch-admin.controller.js";

const router = express.Router();

router.use(auth, requireRole(["ADMIN"]));

router.get("/", listBranches);
router.post("/", createBranch);
router.patch("/:id", updateBranch);
router.delete("/:id", deleteBranch);

export default router;

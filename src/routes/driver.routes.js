import express from "express";
import auth from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  getDriverEvents,
  createDriverEvent,
  getMyDriverEvents
} from "../controllers/driver.controller.js";

const router = express.Router();

router.get("/events", auth, requireRole(["DRIVER"]), getDriverEvents);
router.post("/events", auth, requireRole(["DRIVER"]), createDriverEvent);
router.get("/my-events", auth, requireRole(["DRIVER"]), getMyDriverEvents);

export default router;
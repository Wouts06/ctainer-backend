import express from "express";
import { getAdminEvents } from "../controllers/admin-events.controller.js";

const router = express.Router();

router.get("/events", getAdminEvents);

export default router;
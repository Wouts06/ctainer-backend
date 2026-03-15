import express from "express";
import auth from "../middleware/auth.middleware.js";
import { registerPushToken } from "../controllers/push.controller.js";

const router = express.Router();

router.post("/register", auth, registerPushToken);

export default router;
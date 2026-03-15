import express from "express";
import prisma from "../prisma.js";
import { verifyToken } from "../utils/jwt.js";

const router = express.Router();

let clients = [];

/* ===================================
   DRIVER CONNECTS TO LIVE EVENT STREAM
=================================== */
router.get("/events", async (req, res) => {

  try {

    const token = req.query.token;

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || !user.active) {
      return res.status(401).json({ message: "Invalid user" });
    }

    /* ===== SSE HEADERS ===== */

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    const clientId = Date.now();

    const newClient = {
      id: clientId,
      branchId: user.branchId,
      res
    };

    clients.push(newClient);

    console.log("Driver connected to live stream");

    req.on("close", () => {
      clients = clients.filter(c => c.id !== clientId);
      console.log("Driver disconnected");
    });

  } catch (err) {

    console.error("Live stream auth failed:", err);

    return res.status(401).json({ message: "Invalid token" });

  }

});

/* ===================================
   BROADCAST EVENTS TO DRIVERS
=================================== */

export function broadcastEvent(branchId, payload) {

  clients
    .filter(c => c.branchId === branchId)
    .forEach(c => {

      c.res.write(`data: ${JSON.stringify(payload)}\n\n`);

    });

}

export default router;
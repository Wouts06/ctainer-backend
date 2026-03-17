import express from "express";

const router = express.Router();

/* ======================================================
   SSE CLIENTS (ADMIN)
====================================================== */
let clients = [];

/* ======================================================
   ADMIN LIVE EVENTS STREAM
====================================================== */
router.get("/events", (req, res) => {

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    res
  };

  clients.push(newClient);

  console.log("Admin SSE client connected:", clientId);

  // keep connection alive
  const interval = setInterval(() => {
    res.write(`: keep-alive\n\n`);
  }, 25000);

  req.on("close", () => {
    console.log("Admin SSE client disconnected:", clientId);

    clearInterval(interval);

    clients = clients.filter(c => c.id !== clientId);
  });

});

/* ======================================================
   BROADCAST FUNCTION
====================================================== */
export function broadcastAdminEvent(data) {

  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });

}

export default router;
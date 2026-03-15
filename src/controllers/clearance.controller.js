import prisma from "../prisma.js";
import { addDays, startOfDay } from "date-fns";
import { createClearanceSchema } from "../validators/clearance.validator.js";
import admin from "../utils/firebase.js";
import { broadcastEvent } from "../routes/driver-live.routes.js";

/* ======================================================
   PUSH NOTIFICATION — NOTIFY DRIVERS OF NEW EVENT
====================================================== */
async function notifyBranchDrivers(branchId, event) {
  try {
    const tokens = await prisma.pushToken.findMany({
      where: { branchId }
    });

    if (!tokens.length) return;

    const registrationTokens = tokens.map(t => t.token);

    await admin.messaging().sendEachForMulticast({
      tokens: registrationTokens,
      notification: {
        title: "New Clearing Event",
        body: `${event.agentWaybill} ready for clearance`
      },
      data: {
        eventId: event.id
      }
    });

  } catch (err) {
    console.error("Push notification failed:", err);
  }
}

/* ======================================================
   DRIVER — FETCH EVENTS FOR BRANCH (QUEUE)
====================================================== */
export async function getAvailableClearanceEvents(req, res) {
  const { agentId } = req.query;

  if (!req.user.branchId) {
    return res
      .status(400)
      .json({ message: "Driver is not assigned to a branch" });
  }

  const today = startOfDay(new Date());

  const events = await prisma.clearanceEvent.findMany({
    where: {
      ...(agentId && { agentId }),
      destinationBranchId: req.user.branchId,
      status: {
        in: ["IN_TRANSIT", "AWAITING_CLEARANCE", "PARTIAL_OPEN"]
      }
    },
    include: {
      agent: true,
      originBranch: true,
      destinationBranch: true,
      manifests: true
    },
    orderBy: {
      expectedClearableAt: "asc"
    }
  });

  // Overdue logic
  const enriched = events.map(event => {
    let overdue = false;

    if (event.agent.transportType === "AIR") {
      overdue = today > event.expectedClearableAt;
    }

    if (event.agent.transportType === "ROAD") {
      overdue = today > addDays(event.expectedClearableAt, 5);
    }

    return {
      ...event,
      overdue
    };
  });

  res.json(enriched);
}

/* ======================================================
   CREATE CLEARANCE EVENT
   ADMIN / OFFICE / DRIVER SAFE
====================================================== */
export async function createClearanceEvent(req, res) {
  try {
    let input = { ...req.body };

    /* -------------------------------
       DRIVER AUTO BRANCH LOCK
    -------------------------------- */
    if (req.user.role === "DRIVER") {

      if (!req.user.branchId) {
        return res
          .status(400)
          .json({ message: "Driver has no branch assigned" });
      }

      // Lock origin branch
      input.originBranchId = req.user.branchId;

      // Prevent same origin/destination
      if (input.destinationBranchId === req.user.branchId) {
        return res.status(400).json({
          message: "Destination cannot be the same as origin branch"
        });
      }
    }

    /* -------------------------------
       VALIDATE AFTER INJECTION
    -------------------------------- */
    const parsed = createClearanceSchema.parse(input);

    /* -------------------------------
       VALIDATE AGENT
    -------------------------------- */
    const agent = await prisma.agent.findUnique({
      where: { id: parsed.agentId }
    });

    if (!agent) {
      return res.status(400).json({ message: "Invalid agent" });
    }

    /* -------------------------------
       EXPECTED CLEAR DATE LOGIC
    -------------------------------- */
    let expectedClearableAt = new Date();

    if (agent.transportType === "AIR") {
      expectedClearableAt = addDays(expectedClearableAt, 1);
    }

    if (agent.transportType === "ROAD") {
      expectedClearableAt = addDays(expectedClearableAt, 3);
    }

    /* -------------------------------
       CREATE EVENT TRANSACTION
    -------------------------------- */
    const event = await prisma.$transaction(async tx => {

      const clearanceEvent = await tx.clearanceEvent.create({
        data: {
          originBranch: { connect: { id: parsed.originBranchId } },
          destinationBranch: { connect: { id: parsed.destinationBranchId } },
          agent: { connect: { id: parsed.agentId } },
          createdBy: { connect: { id: req.user.id } },
          expectedClearableAt,
          status: "IN_TRANSIT",
          agentWaybill: parsed.agentWaybill
        }
      });

      /* -------------------------------
         UPSERT MANIFESTS
      -------------------------------- */
      const manifestIds = [];

      for (const manifestNumber of parsed.manifestNumbers) {

        const manifest = await tx.manifest.upsert({
          where: { manifestNumber },
          update: {},
          create: { manifestNumber }
        });

        manifestIds.push({ id: manifest.id });
      }

      /* -------------------------------
         ATTACH MANIFESTS
      -------------------------------- */
      await tx.clearanceEvent.update({
        where: { id: clearanceEvent.id },
        data: {
          manifests: {
            connect: manifestIds
          }
        }
      });

      return clearanceEvent;
    });

    /* -------------------------------
       SEND PUSH NOTIFICATION
    -------------------------------- */
    notifyBranchDrivers(parsed.destinationBranchId, event);

    /* -------------------------------
       BROADCAST LIVE UPDATE (SSE)
    -------------------------------- */
    broadcastEvent(parsed.destinationBranchId, {
      type: "NEW_EVENT",
      eventId: event.id
    });

    res.status(201).json(event);

  } catch (err) {

    console.error("CREATE CLEARANCE ERROR:", err);

    if (err.name === "ZodError") {
      return res.status(400).json({ message: err.errors });
    }

    res.status(500).json({ message: "Failed to create clearance event" });
  }
}
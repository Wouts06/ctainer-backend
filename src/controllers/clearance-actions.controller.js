import prisma from "../prisma.js";
import {
  successSchema,
  partialSchema,
  failedSchema
} from "../validators/clearance-actions.validator.js";

/**
 * Driver - Successful clearance
 */
export async function clearSuccess(req, res) {
  const input = successSchema.parse(req.body);

  const event = await prisma.clearanceEvent.update({
  where: { id: input.clearanceEventId },
  data: {
    status: "CLEARED_SUCCESS",
    clearedAt: new Date(),
    clearedBy: { connect: { id: req.user.id } }
  }
});


  res.json(event);
}

/**
 * Driver - Partial clearance
 */
export async function clearPartial(req, res) {
  try {
    const input = partialSchema.parse(req.body);

    await prisma.clearanceEvent.update({
      where: { id: input.clearanceEventId },
      data: {
        status: "PARTIAL_OPEN",
        firstClearedAt: new Date(),
        clearedAt: null,
        clearedBy: { connect: { id: req.user.id } }
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to partially clear event" });
  }
}


/**
 * Driver - Failed clearance
 */
export async function clearFailed(req, res) {
  console.log("❌ FAIL ENDPOINT HIT:", req.body);
  const input = failedSchema.parse(req.body);

  await prisma.$transaction(async tx => {
await tx.clearanceEvent.update({
  where: { id: input.clearanceEventId },
  data: {
    status: "CLEARED_FAILED",
    clearedAt: new Date(),
    clearedBy: { connect: { id: req.user.id } }
  }
});


    await tx.clearanceException.create({
      data: {
        clearanceEvent: { connect: { id: input.clearanceEventId } },
        reason: input.reason
      }
    });
  });

  res.json({ success: true });
}

/**
 * Admin - Override / Close event
 */
export async function adminOverride(req, res) {
  const { clearanceEventId } = req.body;

  const event = await prisma.clearanceEvent.update({
    where: { id: clearanceEventId },
    data: {
      status: "ADMIN_CLOSED",
      clearedAt: new Date()
    }
  });

  res.json(event);
}
/**
 * Admin - Close event as success
 */
export async function adminCloseSuccess(req, res) {
  try {
    const { clearanceEventId } = req.body;

    await prisma.clearanceEvent.update({
      where: { id: clearanceEventId },
      data: {
        status: "CLEARED_SUCCESS",
        clearedAt: new Date()
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to close as success" });
  }
}

/**
 * Admin - Close event as failed
 */
export async function adminCloseFailed(req, res) {
  try {
    const { clearanceEventId, reason } = req.body;

    await prisma.$transaction(async tx => {
      await tx.clearanceEvent.update({
        where: { id: clearanceEventId },
        data: {
          status: "CLEARED_FAILED",
          clearedAt: new Date()
        }
      });

      await tx.clearanceException.create({
        data: {
          clearanceEvent: { connect: { id: clearanceEventId } },
          reason
        }
      });
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to close as failed" });
  }
}

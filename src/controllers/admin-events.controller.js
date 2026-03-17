import prisma from "../prisma.js";

export async function getAdminEvents(req, res) {
  try {

    const { status, branchId } = req.query;

    const where = {};

    // 🔹 Filter by destination branch
    if (branchId) {
      where.destinationBranchId = branchId;
    }

    // 🔹 Status filters
    if (status === "open") {
      where.status = {
        in: ["IN_TRANSIT", "AWAITING_CLEARANCE", "PARTIAL_OPEN"]
      };
    }

    if (status === "overdue") {
      where.overdue = true;
    }

    if (status === "clearedToday") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      where.clearedAt = {
        gte: today
      };
    }

    if (status === "exceptions") {
      where.status = "CLEARED_FAILED";
    }

    const events = await prisma.clearanceEvent.findMany({
      where,
      include: {
        agent: true,
        originBranch: true,
        destinationBranch: true,
        manifests: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(events);

  } catch (err) {
    console.error("Admin events error:", err);
    res.status(500).json({ message: "Failed to load admin events" });
  }
}
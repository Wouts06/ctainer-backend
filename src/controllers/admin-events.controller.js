import prisma from "../prisma.js";

export async function getAdminEvents(req, res) {
  try {

    const { status, branchId } = req.query;

    const where = {};

    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    // 🔹 Filter by destination branch
    if (branchId) {
      where.destinationBranchId = Number(branchId); // ✅ ensure correct type
    }

    // 🔹 Status filters
    if (status === "open") {
      where.status = {
        in: ["IN_TRANSIT", "AWAITING_CLEARANCE", "PARTIAL_OPEN"]
      };
    }

    else if (status === "overdue") {
      where.expectedClearableAt = {
        lt: startOfToday
      };
    }

    else if (status === "due-today") {
      where.expectedClearableAt = {
        gte: startOfToday,
        lt: endOfToday
      };
    }

    else if (status === "upcoming") {
      where.expectedClearableAt = {
        gte: endOfToday
      };
    }

    else if (status === "clearedToday") {
      where.clearedAt = {
        gte: startOfToday
      };
    }

    else if (status === "exceptions") {
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
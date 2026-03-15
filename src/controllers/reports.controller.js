import prisma from "../prisma.js";
import { addDays, startOfDay } from "date-fns";

/* ===============================
   PARTIAL OPEN EVENTS (ADMIN)
================================ */
export async function partialOpenEvents(req, res) {
  const events = await prisma.clearanceEvent.findMany({
    where: { status: "PARTIAL_OPEN" },
    include: {
      agent: true,
      originBranch: true,
      destinationBranch: true,
      exceptions: { include: { waybill: true } }
    },
    orderBy: { firstClearedAt: "desc" }
  });

  res.json(events);
}

/* ===============================
   REPORT 1 - AVG CLEARING TIME
================================ */
export async function averageClearingTimePerAgent(req, res) {
  try {
    const { from, to, status, branchId, trend, export: exportType } = req.query;

    const where = {
      clearedAt: { not: null },
      status: { in: ["CLEARED_SUCCESS", "CLEARED_FAILED"] }
    };

    if (status === "SUCCESS") where.status = "CLEARED_SUCCESS";
    if (status === "FAILED") where.status = "CLEARED_FAILED";

    if (from || to) {
  where.clearedAt = {};

  if (from) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    where.clearedAt.gte = start;
  }

  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    where.clearedAt.lte = end;
  }
}

    if (branchId) where.destinationBranchId = branchId;

    const events = await prisma.clearanceEvent.findMany({
      where,
      include: { agent: true, destinationBranch: true }
    });

    if (!events.length) return res.json([]);

    if (trend) {
      const bucket = {};
      for (const e of events) {
        const d = new Date(e.clearedAt);
        const key =
          trend === "month"
            ? `${d.getFullYear()}-${d.getMonth() + 1}`
            : d.toISOString().slice(0, 10);

        const days = (e.clearedAt - e.createdAt) / 86400000;
        bucket[key] ??= { total: 0, count: 0 };
        bucket[key].total += days;
        bucket[key].count++;
      }

      return res.json(
        Object.entries(bucket).map(([period, v]) => ({
          period,
          averageDays: Number((v.total / v.count).toFixed(2)),
          eventCount: v.count
        }))
      );
    }

    const grouped = {};
    for (const e of events) {
      grouped[e.agent.id] ??= {
        agent: e.agent.name,
        branch: e.destinationBranch?.name,
        total: 0,
        count: 0
      };

      grouped[e.agent.id].total +=
        (e.clearedAt - e.createdAt) / 86400000;
      grouped[e.agent.id].count++;
    }

    const result = Object.values(grouped).map(r => ({
      ...r,
      averageDays: Number((r.total / r.count).toFixed(2))
    }));

    if (exportType === "csv") {
      const csv =
        "Agent,Branch,Average Days,Event Count\n" +
        result
          .map(r =>
            [r.agent, r.branch, r.averageDays, r.count].join(",")
          )
          .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=avg.csv");
      return res.send(csv);
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Report failed" });
  }
}

/* ===============================
   REPORT 2 - OVERDUE
================================ */
export async function overduePerAgent(req, res) {
  try {
    const { from, to, branchId, trend } = req.query;
    const today = startOfDay(new Date());

    const where = {
      status: { in: ["IN_TRANSIT", "AWAITING_CLEARANCE", "PARTIAL_OPEN"] }
    };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    if (branchId) where.destinationBranchId = branchId;

    const events = await prisma.clearanceEvent.findMany({
      where,
      include: { agent: true, destinationBranch: true }
    });

    const isOverdue = e =>
      e.agent.transportType === "AIR"
        ? today > e.expectedClearableAt
        : today > addDays(e.expectedClearableAt, 5);

    if (trend) {
      const bucket = {};
      for (const e of events.filter(isOverdue)) {
        const d = new Date(e.expectedClearableAt);
        const key =
          trend === "month"
            ? `${d.getFullYear()}-${d.getMonth() + 1}`
            : d.toISOString().slice(0, 10);
        bucket[key] = (bucket[key] || 0) + 1;
      }

      return res.json(
        Object.entries(bucket).map(([period, count]) => ({
          period,
          overdueEvents: count
        }))
      );
    }

    const grouped = {};
    for (const e of events) {
      const key = `${e.agent.id}-${e.destinationBranchId}`;
      grouped[key] ??= {
        agent: e.agent.name,
        branch: e.destinationBranch.name,
        overdue: 0,
        onTime: 0
      };

      isOverdue(e) ? grouped[key].overdue++ : grouped[key].onTime++;
    }

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Overdue report failed" });
  }
}

/* ===============================
   REPORT 3 - WAYBILLS EXPORT
================================ */
export async function exportWaybillsAndManifests(req, res) {
  try {
    const events = await prisma.clearanceEvent.findMany({
      include: {
        agent: true,
        originBranch: true,
        destinationBranch: true,
        manifests: true
      },
      orderBy: { createdAt: "desc" }
    });

    const headers = [
      "Agent",
      "Transport",
      "Agent Waybill",
      "Manifest",
      "Origin",
      "Destination",
      "Status",
      "Created",
      "Expected Clear",
      "First Attempt",
      "Final Clear"
    ];

    const rows = [];

    for (const e of events) {
      if (e.manifests.length) {
        for (const m of e.manifests) {
          rows.push([
            e.agent.name,
            e.agent.transportType,
            e.agentWaybill,
            m.manifestNumber,
            e.originBranch.name,
            e.destinationBranch.name,
            e.status,
            e.createdAt,
            e.expectedClearableAt,
            e.firstClearedAt || "",
            e.clearedAt || ""
          ]);
        }
      } else {
        rows.push([
          e.agent.name,
          e.agent.transportType,
          e.agentWaybill,
          "",
          e.originBranch.name,
          e.destinationBranch.name,
          e.status,
          e.createdAt,
          e.expectedClearableAt,
          e.firstClearedAt || "",
          e.clearedAt || ""
        ]);
      }
    }

    const csv =
      headers.join(",") +
      "\n" +
      rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=waybills.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Export failed" });
  }
}

/* ===============================
   REPORT 4 - DRIVER PRODUCTIVITY
================================ */
export async function driverProductivity(req, res) {
  try {
    const events = await prisma.clearanceEvent.findMany({
      where: {
        status: { in: ["CLEARED_SUCCESS", "CLEARED_FAILED"] },
        clearedByUserId: { not: null }
      },
      include: { clearedBy: true, destinationBranch: true }
    });

    const grouped = {};

    for (const e of events) {
      grouped[e.clearedBy.id] ??= {
        driver: e.clearedBy.email,
        branch: e.destinationBranch?.name,
        clearedEvents: 0
      };
      grouped[e.clearedBy.id].clearedEvents++;
    }

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Driver productivity failed" });
  }
}

/* ===============================
   REPORT 5 - EXCEPTIONS
================================ */
export async function exceptionRecall(req, res) {
  try {
    const exceptions = await prisma.clearanceException.findMany({
      where: { resolvedAt: null },
      include: {
        waybill: true,
        clearanceEvent: {
          include: {
            agent: true,
            originBranch: true,
            destinationBranch: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(exceptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load exceptions" });
  }
}

/* ===============================
   DASHBOARD SUMMARY
================================ */

export async function dashboardSummary(req, res) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      openEvents,
      partialEvents,
      overdueEvents,
      clearedToday
    ] = await Promise.all([
      prisma.clearanceEvent.count({
        where: { status: { in: ["IN_TRANSIT", "AWAITING_CLEARANCE"] } }
      }),

      prisma.clearanceEvent.count({
        where: { status: "PARTIAL_OPEN" }
      }),

      prisma.clearanceEvent.count({
        where: {
          status: { in: ["IN_TRANSIT", "AWAITING_CLEARANCE", "PARTIAL_OPEN"] },
          expectedClearableAt: { lt: new Date() }
        }
      }),

      prisma.clearanceEvent.count({
        where: {
          status: { in: ["CLEARED_SUCCESS", "CLEARED_FAILED"] },
          clearedAt: { gte: todayStart }
        }
      })
    ]);

    res.json({
      openEvents,
      partialEvents,
      overdueEvents,
      clearedToday
    });
  } catch (err) {
    console.error("DASHBOARD SUMMARY ERROR:", err);
    res.status(500).json({ message: "Failed to load dashboard summary" });
  }
}


import prisma from "../prisma.js";

export async function getDriverEvents(req, res) {
  const events = await prisma.clearanceEvent.findMany({
    where: {
      destinationBranchId: req.user.branchId,
      status: {
        in: ["IN_TRANSIT", "AWAITING_CLEARANCE", "PARTIAL_OPEN"]
      }
    },
    include: {
      agent: true,
      originBranch: true,
      manifests: true
    },
    orderBy: {
      expectedClearableAt: "asc"
    }
  });

  res.json(events);
}

export async function createDriverEvent(req, res) {
  const {
    destinationBranchId,
    agentId,
    agentWaybill,
    manifestNumbers
  } = req.body;

  const event = await prisma.clearanceEvent.create({
    data: {
      originBranchId: req.user.branchId,
      destinationBranchId,
      agentId,
      agentWaybill,
      expectedClearableAt: new Date(),
      createdByUserId: req.user.id,
      manifests: {
        connectOrCreate: manifestNumbers.map(m => ({
          where: { manifestNumber: m },
          create: { manifestNumber: m }
        }))
      }
    }
  });

  res.json(event);
}

export async function getMyDriverEvents(req, res) {
  const events = await prisma.clearanceEvent.findMany({
    where: {
      createdByUserId: req.user.id
    },
    include: {
      agent: true,
      destinationBranch: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json(events);
}
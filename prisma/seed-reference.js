import prisma from "../src/prisma.js";

async function main() {
  /* =========================
     BRANCHES
  ========================= */

  const branches = [
    "Cape Town",
    "Johannesburg",
    "Port Elizabeth",
    "Durban",
    "Bloemfontein",
    "George"
  ];

  for (const name of branches) {
    await prisma.branch.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  /* =========================
     AGENTS
  ========================= */

  const agents = [
    { name: "BidAir Cargo", transportType: "AIR" },
    { name: "SafeFly", transportType: "AIR" },
    { name: "Cargobarn", transportType: "ROAD" },
    { name: "Lonroh", transportType: "ROAD" },
    { name: "Intertown", transportType: "ROAD" }
  ];

  for (const agent of agents) {
    await prisma.agent.upsert({
      where: { name: agent.name },
      update: {},
      create: agent
    });
  }

  console.log("✅ Branches and Agents seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

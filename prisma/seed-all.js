import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // -------------------
  // BRANCHES
  // -------------------
  const branches = await prisma.branch.createMany({
    data: [
      { name: "Cape Town" },
      { name: "Johannesburg" },
      { name: "Port Elizabeth" },
      { name: "Durban" },
      { name: "Bloemfontein" },
      { name: "George" }
    ],
    skipDuplicates: true
  });

  const allBranches = await prisma.branch.findMany();

  const jhbBranch = allBranches.find(b => b.name === "Johannesburg");

  if (!jhbBranch) {
    throw new Error("Johannesburg branch not found after seeding");
  }

  console.log("✅ Branches seeded");

  // -------------------
  // AGENTS
  // -------------------
  await prisma.agent.createMany({
    data: [
      { name: "BidAir Cargo", transportType: "AIR" },
      { name: "SafeFly", transportType: "AIR" },
      { name: "Cargobarn", transportType: "ROAD" },
      { name: "Lonroh", transportType: "ROAD" },
      { name: "Intertown", transportType: "ROAD" }
    ],
    skipDuplicates: true
  });

  console.log("✅ Agents seeded");

  // -------------------
  // USERS
  // -------------------
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  await prisma.user.upsert({
    where: { email: "driver@mycouriersa.co.za" },
    update: {
      name: "Test Driver",
      role: "DRIVER",
      password: hashedPassword,
      branchId: jhbBranch.id
    },
    create: {
      email: "driver@mycouriersa.co.za",
      name: "Test Driver",
      role: "DRIVER",
      password: hashedPassword,
      branchId: jhbBranch.id
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@mycouriersa.co.za" },
    update: {
      name: "Admin User",
      role: "ADMIN",
      password: hashedPassword,
      branchId: jhbBranch.id
    },
    create: {
      email: "admin@mycouriersa.co.za",
      name: "Admin User",
      role: "ADMIN",
      password: hashedPassword,
      branchId: jhbBranch.id
    }
  });

  console.log("✅ Users seeded");
}

main()
  .catch(e => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

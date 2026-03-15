import bcrypt from "bcrypt";
import prisma from "../src/prisma.js";

async function main() {
  const password = await bcrypt.hash("ChangeMe123!", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Wouter Breytenbach",
        email: "wouter@mycouriersa.co.za",
        password,
        role: "ADMIN"
      },
      {
        name: "Office User",
        email: "office@mycouriersa.co.za",
        password,
        role: "OFFICE"
      },
      {
        name: "Driver User",
        email: "driver@mycouriersa.co.za",
        password,
        role: "DRIVER"
      }
    ],
    skipDuplicates: true
  });

  console.log("✅ Users seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

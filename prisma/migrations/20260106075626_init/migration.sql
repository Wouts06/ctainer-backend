-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OFFICE', 'DRIVER');

-- CreateEnum
CREATE TYPE "FreightStatus" AS ENUM ('LODGED', 'ASSIGNED', 'IN_TRANSIT', 'CLEARED', 'DELIVERED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Freight" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "status" "FreightStatus" NOT NULL DEFAULT 'LODGED',
    "createdById" TEXT NOT NULL,
    "assignedDriverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Freight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreightStatusLog" (
    "id" TEXT NOT NULL,
    "freightId" TEXT NOT NULL,
    "status" "FreightStatus" NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreightStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Freight_reference_key" ON "Freight"("reference");

-- AddForeignKey
ALTER TABLE "Freight" ADD CONSTRAINT "Freight_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Freight" ADD CONSTRAINT "Freight_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreightStatusLog" ADD CONSTRAINT "FreightStatusLog_freightId_fkey" FOREIGN KEY ("freightId") REFERENCES "Freight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

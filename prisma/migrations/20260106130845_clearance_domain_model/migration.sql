/*
  Warnings:

  - You are about to drop the `Freight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FreightStatusLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TransportType" AS ENUM ('AIR', 'ROAD');

-- CreateEnum
CREATE TYPE "ClearanceStatus" AS ENUM ('LODGED', 'IN_TRANSIT', 'AWAITING_CLEARANCE', 'CLEARED_SUCCESS', 'CLEARED_PARTIAL', 'CLEARED_FAILED', 'EXCEPTION_REVIEW', 'ADMIN_CLOSED');

-- DropForeignKey
ALTER TABLE "Freight" DROP CONSTRAINT "Freight_assignedDriverId_fkey";

-- DropForeignKey
ALTER TABLE "Freight" DROP CONSTRAINT "Freight_createdById_fkey";

-- DropForeignKey
ALTER TABLE "FreightStatusLog" DROP CONSTRAINT "FreightStatusLog_freightId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "branchId" TEXT;

-- DropTable
DROP TABLE "Freight";

-- DropTable
DROP TABLE "FreightStatusLog";

-- DropEnum
DROP TYPE "FreightStatus";

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "transportType" "TransportType" NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClearanceEvent" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "originBranchId" TEXT NOT NULL,
    "destinationBranchId" TEXT NOT NULL,
    "status" "ClearanceStatus" NOT NULL DEFAULT 'LODGED',
    "expectedClearableAt" TIMESTAMP(3) NOT NULL,
    "clearedAt" TIMESTAMP(3),
    "clearedByUserId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClearanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manifest" (
    "id" TEXT NOT NULL,
    "manifestNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Manifest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentWaybill" (
    "id" TEXT NOT NULL,
    "waybillNumber" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentWaybill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManifestWaybill" (
    "id" TEXT NOT NULL,
    "manifestId" TEXT NOT NULL,
    "waybillId" TEXT NOT NULL,

    CONSTRAINT "ManifestWaybill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClearanceException" (
    "id" TEXT NOT NULL,
    "clearanceEventId" TEXT NOT NULL,
    "waybillId" TEXT,
    "reason" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolvedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClearanceException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventManifests" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventManifests_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_key" ON "Branch"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_name_key" ON "Agent"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Manifest_manifestNumber_key" ON "Manifest"("manifestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AgentWaybill_waybillNumber_agentId_key" ON "AgentWaybill"("waybillNumber", "agentId");

-- CreateIndex
CREATE UNIQUE INDEX "ManifestWaybill_manifestId_waybillId_key" ON "ManifestWaybill"("manifestId", "waybillId");

-- CreateIndex
CREATE INDEX "_EventManifests_B_index" ON "_EventManifests"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceEvent" ADD CONSTRAINT "ClearanceEvent_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceEvent" ADD CONSTRAINT "ClearanceEvent_originBranchId_fkey" FOREIGN KEY ("originBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceEvent" ADD CONSTRAINT "ClearanceEvent_destinationBranchId_fkey" FOREIGN KEY ("destinationBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceEvent" ADD CONSTRAINT "ClearanceEvent_clearedByUserId_fkey" FOREIGN KEY ("clearedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceEvent" ADD CONSTRAINT "ClearanceEvent_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentWaybill" ADD CONSTRAINT "AgentWaybill_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManifestWaybill" ADD CONSTRAINT "ManifestWaybill_manifestId_fkey" FOREIGN KEY ("manifestId") REFERENCES "Manifest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManifestWaybill" ADD CONSTRAINT "ManifestWaybill_waybillId_fkey" FOREIGN KEY ("waybillId") REFERENCES "AgentWaybill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceException" ADD CONSTRAINT "ClearanceException_clearanceEventId_fkey" FOREIGN KEY ("clearanceEventId") REFERENCES "ClearanceEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceException" ADD CONSTRAINT "ClearanceException_waybillId_fkey" FOREIGN KEY ("waybillId") REFERENCES "AgentWaybill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceException" ADD CONSTRAINT "ClearanceException_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventManifests" ADD CONSTRAINT "_EventManifests_A_fkey" FOREIGN KEY ("A") REFERENCES "ClearanceEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventManifests" ADD CONSTRAINT "_EventManifests_B_fkey" FOREIGN KEY ("B") REFERENCES "Manifest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

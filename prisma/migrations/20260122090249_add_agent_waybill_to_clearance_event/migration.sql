/*
  Warnings:

  - The values [CLEARED_PARTIAL,EXCEPTION_REVIEW] on the enum `ClearanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `agentWaybill` to the `ClearanceEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ClearanceStatus_new" AS ENUM ('LODGED', 'IN_TRANSIT', 'AWAITING_CLEARANCE', 'PARTIAL_OPEN', 'CLEARED_SUCCESS', 'CLEARED_FAILED', 'ADMIN_CLOSED');
ALTER TABLE "public"."ClearanceEvent" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ClearanceEvent" ALTER COLUMN "status" TYPE "ClearanceStatus_new" USING ("status"::text::"ClearanceStatus_new");
ALTER TYPE "ClearanceStatus" RENAME TO "ClearanceStatus_old";
ALTER TYPE "ClearanceStatus_new" RENAME TO "ClearanceStatus";
DROP TYPE "public"."ClearanceStatus_old";
ALTER TABLE "ClearanceEvent" ALTER COLUMN "status" SET DEFAULT 'LODGED';
COMMIT;

-- AlterTable
ALTER TABLE "ClearanceEvent" ADD COLUMN     "agentWaybill" TEXT NOT NULL;

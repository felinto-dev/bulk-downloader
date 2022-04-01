/*
  Warnings:

  - You are about to drop the column `quotaRenewsAt` on the `Hoster` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hoster" DROP COLUMN "quotaRenewsAt";

-- AlterTable
ALTER TABLE "HosterQuota" ADD COLUMN     "quotaRenewsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

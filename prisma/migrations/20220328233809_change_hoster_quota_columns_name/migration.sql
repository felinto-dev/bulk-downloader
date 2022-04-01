/*
  Warnings:

  - You are about to drop the column `daily` on the `HosterQuota` table. All the data in the column will be lost.
  - You are about to drop the column `hourly` on the `HosterQuota` table. All the data in the column will be lost.
  - You are about to drop the column `monthly` on the `HosterQuota` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HosterQuota" DROP COLUMN "daily",
DROP COLUMN "hourly",
DROP COLUMN "monthly",
ADD COLUMN     "dailyDownloadLimit" INTEGER,
ADD COLUMN     "hourlyDownloadLimit" INTEGER,
ADD COLUMN     "monthlyDownloadLimit" INTEGER;

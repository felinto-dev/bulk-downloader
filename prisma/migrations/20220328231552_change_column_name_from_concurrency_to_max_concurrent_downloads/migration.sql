/*
  Warnings:

  - You are about to drop the column `concurrency` on the `Hoster` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hoster" DROP COLUMN "concurrency",
ADD COLUMN     "maxConcurrentDownloads" INTEGER NOT NULL DEFAULT 0;

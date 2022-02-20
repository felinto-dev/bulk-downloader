/*
  Warnings:

  - You are about to drop the column `weekly` on the `HosterLimits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HosterLimits" DROP COLUMN "weekly",
ADD COLUMN     "daily" INTEGER;

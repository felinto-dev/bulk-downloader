/*
  Warnings:

  - The primary key for the `HosterLimits` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `HosterLimits` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "HosterLimits_hosterId_key";

-- AlterTable
ALTER TABLE "HosterLimits" DROP CONSTRAINT "HosterLimits_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "HosterLimits_pkey" PRIMARY KEY ("hosterId");

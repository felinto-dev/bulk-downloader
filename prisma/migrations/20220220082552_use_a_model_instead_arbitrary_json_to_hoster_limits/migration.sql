/*
  Warnings:

  - You are about to drop the column `limits` on the `Hoster` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hoster" DROP COLUMN "limits";

-- CreateTable
CREATE TABLE "HosterLimits" (
    "id" TEXT NOT NULL,
    "hourly" INTEGER,
    "weekly" INTEGER,
    "monthly" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hosterId" TEXT NOT NULL,

    CONSTRAINT "HosterLimits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HosterLimits_hosterId_key" ON "HosterLimits"("hosterId");

-- AddForeignKey
ALTER TABLE "HosterLimits" ADD CONSTRAINT "HosterLimits_hosterId_fkey" FOREIGN KEY ("hosterId") REFERENCES "Hoster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

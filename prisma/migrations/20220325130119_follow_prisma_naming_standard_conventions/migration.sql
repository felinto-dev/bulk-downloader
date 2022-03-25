/*
  Warnings:

  - You are about to drop the `HosterLimits` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HosterLimits" DROP CONSTRAINT "HosterLimits_hosterId_fkey";

-- DropTable
DROP TABLE "HosterLimits";

-- CreateTable
CREATE TABLE "HosterLimit" (
    "hourly" INTEGER,
    "daily" INTEGER,
    "monthly" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hosterId" TEXT NOT NULL,

    CONSTRAINT "HosterLimit_pkey" PRIMARY KEY ("hosterId")
);

-- AddForeignKey
ALTER TABLE "HosterLimit" ADD CONSTRAINT "HosterLimit_hosterId_fkey" FOREIGN KEY ("hosterId") REFERENCES "Hoster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

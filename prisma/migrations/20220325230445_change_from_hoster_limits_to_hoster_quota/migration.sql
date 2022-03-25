/*
  Warnings:

  - You are about to drop the `HosterLimit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HosterLimit" DROP CONSTRAINT "HosterLimit_hosterId_fkey";

-- DropTable
DROP TABLE "HosterLimit";

-- CreateTable
CREATE TABLE "HosterQuota" (
    "hourly" INTEGER,
    "daily" INTEGER,
    "monthly" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hosterId" TEXT NOT NULL,

    CONSTRAINT "HosterQuota_pkey" PRIMARY KEY ("hosterId")
);

-- AddForeignKey
ALTER TABLE "HosterQuota" ADD CONSTRAINT "HosterQuota_hosterId_fkey" FOREIGN KEY ("hosterId") REFERENCES "Hoster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

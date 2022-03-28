/*
  Warnings:

  - The primary key for the `Hoster` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Hoster` table. All the data in the column will be lost.
  - Added the required column `hosterId` to the `Hoster` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Download" DROP CONSTRAINT "Download_hosterId_fkey";

-- DropForeignKey
ALTER TABLE "HosterQuota" DROP CONSTRAINT "HosterQuota_hosterId_fkey";

-- AlterTable
ALTER TABLE "Hoster" DROP CONSTRAINT "Hoster_pkey",
DROP COLUMN "id",
ADD COLUMN     "hosterId" TEXT NOT NULL,
ADD CONSTRAINT "Hoster_pkey" PRIMARY KEY ("hosterId");

-- AddForeignKey
ALTER TABLE "HosterQuota" ADD CONSTRAINT "HosterQuota_hosterId_fkey" FOREIGN KEY ("hosterId") REFERENCES "Hoster"("hosterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_hosterId_fkey" FOREIGN KEY ("hosterId") REFERENCES "Hoster"("hosterId") ON DELETE RESTRICT ON UPDATE CASCADE;

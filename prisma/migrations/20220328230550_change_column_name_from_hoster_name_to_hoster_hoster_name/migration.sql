/*
  Warnings:

  - You are about to drop the column `name` on the `Hoster` table. All the data in the column will be lost.
  - Added the required column `hosterName` to the `Hoster` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hoster" DROP COLUMN "name",
ADD COLUMN     "hosterName" TEXT NOT NULL;

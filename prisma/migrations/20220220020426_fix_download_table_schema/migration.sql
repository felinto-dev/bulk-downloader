/*
  Warnings:

  - You are about to drop the column `downloadStatus` on the `Download` table. All the data in the column will be lost.
  - Added the required column `url` to the `Download` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Download" DROP COLUMN "downloadStatus",
ADD COLUMN     "status" "DownloadStatus" NOT NULL DEFAULT E'PENDING',
ADD COLUMN     "url" TEXT NOT NULL;

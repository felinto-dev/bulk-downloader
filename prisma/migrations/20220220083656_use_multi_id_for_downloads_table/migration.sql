/*
  Warnings:

  - The primary key for the `Download` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Download` table. All the data in the column will be lost.
  - Added the required column `hosterId` to the `DownloadRequestAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DownloadRequestAttempt" DROP CONSTRAINT "DownloadRequestAttempt_downloadId_fkey";

-- DropIndex
DROP INDEX "Download_downloadId_hosterId_key";

-- AlterTable
ALTER TABLE "Download" DROP CONSTRAINT "Download_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Download_pkey" PRIMARY KEY ("downloadId", "hosterId");

-- AlterTable
ALTER TABLE "DownloadRequestAttempt" ADD COLUMN     "hosterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DownloadRequestAttempt" ADD CONSTRAINT "DownloadRequestAttempt_hosterId_fkey" FOREIGN KEY ("hosterId") REFERENCES "Hoster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadRequestAttempt" ADD CONSTRAINT "DownloadRequestAttempt_downloadId_hosterId_fkey" FOREIGN KEY ("downloadId", "hosterId") REFERENCES "Download"("downloadId", "hosterId") ON DELETE RESTRICT ON UPDATE CASCADE;

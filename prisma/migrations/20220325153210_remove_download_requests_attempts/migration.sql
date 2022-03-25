/*
  Warnings:

  - You are about to drop the `DownloadRequestAttempt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DownloadRequestAttempt" DROP CONSTRAINT "DownloadRequestAttempt_downloadId_hosterId_fkey";

-- DropForeignKey
ALTER TABLE "DownloadRequestAttempt" DROP CONSTRAINT "DownloadRequestAttempt_hosterId_fkey";

-- DropTable
DROP TABLE "DownloadRequestAttempt";

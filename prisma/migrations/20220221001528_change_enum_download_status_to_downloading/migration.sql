/*
  Warnings:

  - The values [WAITING_DOWNLOAD] on the enum `DownloadStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DownloadStatus_new" AS ENUM ('PENDING', 'DOWNLOADING', 'SUCCESS', 'FAILED');
ALTER TABLE "Download" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Download" ALTER COLUMN "status" TYPE "DownloadStatus_new" USING ("status"::text::"DownloadStatus_new");
ALTER TYPE "DownloadStatus" RENAME TO "DownloadStatus_old";
ALTER TYPE "DownloadStatus_new" RENAME TO "DownloadStatus";
DROP TYPE "DownloadStatus_old";
ALTER TABLE "Download" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

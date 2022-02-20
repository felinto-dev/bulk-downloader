-- CreateEnum
CREATE TYPE "HosterAuthenticationMethod" AS ENUM ('FREE');

-- CreateEnum
CREATE TYPE "DownloadStatus" AS ENUM ('PENDING', 'WAITING_DOWNLOAD', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Hoster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "authenticationMethod" "HosterAuthenticationMethod" NOT NULL,
    "limits" JSONB NOT NULL,

    CONSTRAINT "Hoster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Download" (
    "id" TEXT NOT NULL,
    "downloadId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "downloadStatus" "DownloadStatus" NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "hosterId" TEXT NOT NULL,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Download_downloadId_hosterId_key" ON "Download"("downloadId", "hosterId");

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_hosterId_fkey" FOREIGN KEY ("hosterId") REFERENCES "Hoster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

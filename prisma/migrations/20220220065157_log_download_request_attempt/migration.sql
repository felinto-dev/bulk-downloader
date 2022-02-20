-- CreateTable
CREATE TABLE "DownloadRequestAttempt" (
    "id" TEXT NOT NULL,
    "downloadId" TEXT NOT NULL,
    "logs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownloadRequestAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DownloadRequestAttempt" ADD CONSTRAINT "DownloadRequestAttempt_downloadId_fkey" FOREIGN KEY ("downloadId") REFERENCES "Download"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { PendingDownload } from '@/database/interfaces/pending-download';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { PendingDownloadsIterator } from '@/iterators/pending-download.interator';
import { HosterQuotasService } from '@/services/hoster-quotas.service';
import { createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { ConcurrentHosterDownloadsOrchestrator } from '../concurrent-hoster-downloads.orchestrator';
import { DownloadsEnqueueOrchestrator } from '../downloads-enqueue.orchestrator';

describe(DownloadsEnqueueOrchestrator.name, () => {
  let service: DownloadsEnqueueOrchestrator;
  let queue: Queue<DownloadJobDto>;

  const mockedQueue = createMock<Queue<DownloadJobDto>>();
  const mockedHosterQuotasService = createMock<HosterQuotasService>();
  const mockedConcurrentHosterDownloadsOrchestrator =
    createMock<ConcurrentHosterDownloadsOrchestrator>();
  const mockedPendingDownloadsIterator = createMock<PendingDownloadsIterator>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadsEnqueueOrchestrator,
        {
          provide: getQueueToken(DOWNLOADS_PROCESSING_QUEUE),
          useValue: mockedQueue,
        },
        {
          provide: HosterQuotasService,
          useValue: mockedHosterQuotasService,
        },
        {
          provide: ConcurrentHosterDownloadsOrchestrator,
          useValue: mockedConcurrentHosterDownloadsOrchestrator,
        },
        {
          provide: PendingDownloadsIterator,
          useValue: mockedPendingDownloadsIterator,
        },
      ],
    }).compile();

    service = module.get<DownloadsEnqueueOrchestrator>(
      DownloadsEnqueueOrchestrator,
    );
    queue = module.get(getQueueToken(DOWNLOADS_PROCESSING_QUEUE));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(DownloadsEnqueueOrchestrator.prototype.canDownloadNow.name, () => {
    it('should return false if the hoster quota is reached', async () => {
      const download: PendingDownload = {
        hosterId: 'hosterId',
        downloadId: 'downloadId',
        url: 'url',
        Hoster: { maxConcurrentDownloads: 1 },
      };
      mockedHosterQuotasService.hasReachedQuota.mockResolvedValue(true);
      mockedConcurrentHosterDownloadsOrchestrator.countConcurrentDownloadsByHosterId.mockResolvedValue(
        0,
      );
      const result = await service.canDownloadNow(download);
      expect(result).toBe(false);
    });
    it('should return false if the hoster can not do +1 concurrent download', async () => {
      const concurrentDownloads = 1;
      const download: PendingDownload = {
        hosterId: 'hosterId',
        downloadId: 'downloadId',
        url: 'url',
        Hoster: { maxConcurrentDownloads: concurrentDownloads },
      };
      mockedHosterQuotasService.hasReachedQuota.mockResolvedValue(false);
      mockedConcurrentHosterDownloadsOrchestrator.countConcurrentDownloadsByHosterId.mockResolvedValue(
        concurrentDownloads,
      );
      const result = await service.canDownloadNow(download);
      expect(result).toBe(false);
    });
    it('should return true when the hoster has not reached its quota and can do +1 concurrent download', async () => {
      const concurrentDownloads = 0;
      const download: PendingDownload = {
        hosterId: 'hosterId',
        downloadId: 'downloadId',
        url: 'url',
        Hoster: { maxConcurrentDownloads: concurrentDownloads + 1 },
      };
      mockedHosterQuotasService.hasReachedQuota.mockResolvedValue(false);
      mockedConcurrentHosterDownloadsOrchestrator.countConcurrentDownloadsByHosterId.mockResolvedValue(
        concurrentDownloads,
      );
      const result = await service.canDownloadNow(download);
      expect(result).toBe(true);
    });
  });

  describe(DownloadsEnqueueOrchestrator.prototype.run.name, () => {
    it('should abort where there are no pending downloads in database', async () => {
      service.canStartRunning = jest.fn().mockResolvedValueOnce(true);
      mockedPendingDownloadsIterator.hasMore.mockResolvedValueOnce(false);
      await service.run();
      expect(mockedQueue.add).not.toHaveBeenCalled();
    });
    it('should add the download to the queue', async () => {
      service.canStartRunning = jest.fn().mockResolvedValueOnce(true);
      mockedPendingDownloadsIterator.hasMore
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      mockedPendingDownloadsIterator.next
        .mockResolvedValueOnce({
          hosterId: 'hosterId',
          downloadId: 'downloadId',
          url: 'url',
          Hoster: { maxConcurrentDownloads: 1 },
        })
        .mockReturnValueOnce(null);
      service.canDownloadNow = jest.fn().mockResolvedValueOnce(true);
      await service.run();
      expect(queue.add).toHaveBeenCalled();
    });
  });
});

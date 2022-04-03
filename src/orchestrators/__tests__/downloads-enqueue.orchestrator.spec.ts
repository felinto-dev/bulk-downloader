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
    const mockedPendingDownload: PendingDownload = {
      downloadId: 'downloadId',
      hosterId: 'hosterId',
      url: 'url',
    };

    it('should return false if the hoster quota is reached', async () => {
      mockedHosterQuotasService.hasReachedQuota.mockResolvedValue(true);
      mockedConcurrentHosterDownloadsOrchestrator.hasReachedConcurrentDownloadsLimit.mockResolvedValue(
        false,
      );
      const result = await service.canDownloadNow(mockedPendingDownload);
      expect(result).toBe(false);
    });
    it('should return false if the hoster can not do +1 concurrent download', async () => {
      mockedHosterQuotasService.hasReachedQuota.mockResolvedValue(false);
      mockedConcurrentHosterDownloadsOrchestrator.hasReachedConcurrentDownloadsLimit.mockResolvedValue(
        true,
      );
      const result = await service.canDownloadNow(mockedPendingDownload);
      expect(result).toBe(false);
    });
    it('should return true when the hoster has not reached quota and neither concurrent downloads limit', async () => {
      mockedHosterQuotasService.hasReachedQuota.mockResolvedValue(false);
      mockedConcurrentHosterDownloadsOrchestrator.hasReachedConcurrentDownloadsLimit.mockResolvedValue(
        false,
      );
      const result = await service.canDownloadNow(mockedPendingDownload);
      expect(result).toBe(true);
    });
  });

  describe(DownloadsEnqueueOrchestrator.prototype.run.name, () => {
    it('should abort where there are no pending downloads in database', async () => {
      mockedPendingDownloadsIterator.hasNext.mockResolvedValueOnce(false);
      await service.run();
      expect(mockedQueue.add).not.toHaveBeenCalled();
    });
    it('should add the download to the queue', async () => {
      mockedPendingDownloadsIterator.hasNext
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      mockedPendingDownloadsIterator.next
        .mockResolvedValueOnce({
          hosterId: 'hosterId',
          downloadId: 'downloadId',
          url: 'url',
        })
        .mockReturnValueOnce(null);
      service.canDownloadNow = jest.fn().mockResolvedValueOnce(true);
      await service.run();
      expect(queue.add).toHaveBeenCalled();
    });
  });
});

import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { PendingDownload } from '@/database/interfaces/pending-download';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { DownloadsService } from '@/services/downloads.service';
import { HosterQuotasService } from '@/services/hoster-quotas.service';
import { createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { ConcurrentHosterDownloadsOrchestrator } from '../concurrent-hoster-downloads.orchestrator';
import { DownloadsOrquestrator } from '../downloads.orchestrator';

describe(DownloadsOrquestrator.name, () => {
  let service: DownloadsOrquestrator;
  let queue: Queue<DownloadJobDto>;

  const mockedQueue = createMock<Queue<DownloadJobDto>>();
  const mockedHosterQuotasService = createMock<HosterQuotasService>();
  const mockedConcurrentHosterDownloadsOrchestrator =
    createMock<ConcurrentHosterDownloadsOrchestrator>();
  const mockedDownloadsService = createMock<DownloadsService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadsOrquestrator,
        {
          provide: getQueueToken(DOWNLOADS_PROCESSING_QUEUE),
          useValue: mockedQueue,
        },
        {
          provide: DownloadsService,
          useValue: mockedDownloadsService,
        },
        {
          provide: HosterQuotasService,
          useValue: mockedHosterQuotasService,
        },
        {
          provide: ConcurrentHosterDownloadsOrchestrator,
          useValue: mockedConcurrentHosterDownloadsOrchestrator,
        },
      ],
    }).compile();

    service = module.get<DownloadsOrquestrator>(DownloadsOrquestrator);
    queue = module.get(getQueueToken(DOWNLOADS_PROCESSING_QUEUE));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(DownloadsOrquestrator.prototype.canDownload.name, () => {
    it('should return false if the hoster quota is reached', async () => {
      const download: PendingDownload = {
        hosterId: 'hosterId',
        downloadId: 'downloadId',
        url: 'url',
        Hoster: { maxConcurrentDownloads: 1 },
      };
      mockedHosterQuotasService.hasReachedQuota.mockResolvedValue(true);
      const result = await service.canDownload(download);
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
      mockedConcurrentHosterDownloadsOrchestrator.getHosterConcurrentDownloads.mockResolvedValue(
        concurrentDownloads,
      );
      const result = await service.canDownload(download);
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
      mockedConcurrentHosterDownloadsOrchestrator.getHosterConcurrentDownloads.mockResolvedValue(
        concurrentDownloads,
      );
      const result = await service.canDownload(download);
      expect(result).toBe(true);
    });
  });

  describe(DownloadsOrquestrator.prototype.orchestrateDownloads.name, () => {
    it('should abort if there are no downloads in database for pulling', async () => {
      mockedConcurrentHosterDownloadsOrchestrator.getQuotaLeft.mockReturnValueOnce(
        1,
      );
      mockedDownloadsService.findPendingDownload.mockResolvedValueOnce(null);
      await service.orchestrateDownloads();
      expect(mockedQueue.add).not.toHaveBeenCalled();
    });
    it('should add the download to the queue', async () => {
      service.shouldGetDownloads = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);
      service.canDownload = jest.fn().mockReturnValueOnce(true);
      mockedDownloadsService.findPendingDownload
        .mockResolvedValueOnce({
          hosterId: 'hosterId',
          downloadId: 'downloadId',
          url: 'url',
          Hoster: { maxConcurrentDownloads: 1 },
        })
        .mockReturnValueOnce(null);
      await service.orchestrateDownloads();
      expect(queue.add).toHaveBeenCalled();
    });
  });
});

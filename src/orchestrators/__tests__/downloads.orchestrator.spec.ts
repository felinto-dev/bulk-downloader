import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { DownloadsRepository } from '@/repositories/downloads.repository';
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
  const mockedDownloadsRepository = createMock<DownloadsRepository>();
  const mockedConcurrentHosterDownloadsOrchestrator =
    createMock<ConcurrentHosterDownloadsOrchestrator>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadsOrquestrator,
        {
          provide: getQueueToken(DOWNLOADS_PROCESSING_QUEUE),
          useValue: mockedQueue,
        },
        {
          provide: DownloadsRepository,
          useValue: mockedDownloadsRepository,
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

  describe(DownloadsOrquestrator.prototype.pullDownloads.name, () => {
    it('should abort if the active concurrent downloads quota left is 0', async () => {
      service.canPullDownloads = jest.fn().mockReturnValueOnce(false);
      await service.pullDownloads();
      expect(mockedQueue.add).not.toHaveBeenCalled();
    });
    it('should abort if there are no downloads in database for pulling', async () => {
      mockedConcurrentHosterDownloadsOrchestrator.getQuotaLeft.mockReturnValueOnce(
        1,
      );
      mockedDownloadsRepository.findNextDownload.mockResolvedValueOnce(null);
      await service.pullDownloads();
      expect(mockedQueue.add).not.toHaveBeenCalled();
    });
    it('should look for another download in database if the hoster quota has been reached', async () => {
      service.canPullDownloads = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);
      mockedDownloadsRepository.findNextDownload
        .mockResolvedValueOnce({
          hosterId: 'hosterId',
          downloadId: 'downloadId',
          url: 'url',
          Hoster: {
            maxConcurrentDownloads: 1,
          },
        })
        .mockResolvedValueOnce(null);
      mockedHosterQuotasService.hasReachedQuota.mockResolvedValueOnce(true);
      await service.pullDownloads();
      expect(mockedQueue.add).not.toHaveBeenCalled();
      expect(mockedDownloadsRepository.findNextDownload).toHaveBeenCalledTimes(
        2,
      );
    });
    it('should look for another download when the current hoster concurrent downloads is greater than or equal max concurrent downloads for hoster allowed', async () => {
      service.canPullDownloads = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);
      mockedDownloadsRepository.findNextDownload
        .mockResolvedValueOnce({
          hosterId: 'hosterId',
          downloadId: 'downloadId',
          url: 'url',
          Hoster: {
            maxConcurrentDownloads: 1,
          },
        })
        .mockReturnValueOnce(null);
      mockedHosterQuotasService.hasReachedQuota.mockResolvedValueOnce(false);
      mockedConcurrentHosterDownloadsOrchestrator.getHosterConcurrentDownloads.mockResolvedValueOnce(
        1,
      );
      await service.pullDownloads();
      expect(mockedQueue.add).not.toHaveBeenCalled();
      expect(mockedDownloadsRepository.findNextDownload).toHaveBeenCalledTimes(
        2,
      );
    });
    it('should add the download to the queue', async () => {
      service.canPullDownloads = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);
      mockedDownloadsRepository.findNextDownload
        .mockResolvedValueOnce({
          hosterId: 'hosterId',
          downloadId: 'downloadId',
          url: 'url',
          Hoster: { maxConcurrentDownloads: 1 },
        })
        .mockReturnValueOnce(null);
      mockedHosterQuotasService.hasReachedQuota.mockResolvedValueOnce(false);
      mockedConcurrentHosterDownloadsOrchestrator.getHosterConcurrentDownloads.mockResolvedValueOnce(
        0,
      );
      await service.pullDownloads();
      expect(queue.add).toHaveBeenCalledTimes(1);
    });
  });
});

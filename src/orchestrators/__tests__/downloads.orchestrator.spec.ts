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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(DownloadsOrquestrator.prototype.pullDownloads.name, () => {
    it('should abort if the active concurrent downloads quota left is 0', async () => {
      mockedConcurrentHosterDownloadsOrchestrator.getQuotaLeft = jest
        .fn()
        .mockReturnValueOnce(0);
      await service.pullDownloads();
      expect(mockedQueue.add).not.toHaveBeenCalled();
    });
    it('should abort if there are no downloads in database for pulling', async () => {
      mockedConcurrentHosterDownloadsOrchestrator.getQuotaLeft = jest
        .fn()
        .mockReturnValueOnce(1);

      mockedDownloadsRepository.findNextDownload = jest
        .fn()
        .mockResolvedValueOnce(null);
      await service.pullDownloads();
      expect(mockedQueue.add).not.toHaveBeenCalled();
    });
    it('should look for another download in database if the hoster quota has been reached', async () => {
      mockedConcurrentHosterDownloadsOrchestrator.getQuotaLeft = jest
        .fn()
        .mockReturnValueOnce(1);
      mockedDownloadsRepository.findNextDownload = jest
        .fn()
        .mockResolvedValueOnce({ hosterId: 'hosterId' })
        .mockResolvedValueOnce(null);
      mockedHosterQuotasService.hasReachedQuota = jest
        .fn()
        .mockReturnValueOnce(true);
      await service.pullDownloads();
      expect(mockedQueue.add).not.toHaveBeenCalled();
      expect(mockedDownloadsRepository.findNextDownload).toHaveBeenCalledTimes(
        2,
      );
    });
  });
});

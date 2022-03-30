import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { HosterQuotasService } from '@/services/hoster-quotas.service';
import { createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { DownloadsOrquestrator } from '../downloads.orchestrator';

describe(DownloadsOrquestrator.name, () => {
  let service: DownloadsOrquestrator;
  let repository: DownloadsRepository;

  const mockedQueue = createMock<Queue<DownloadJobDto>>();
  const mockedHosterQuotasService = createMock<HosterQuotasService>();
  const mockedDownloadsRepository = createMock<DownloadsRepository>();

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
      ],
    }).compile();

    service = module.get<DownloadsOrquestrator>(DownloadsOrquestrator);
    repository = module.get<DownloadsRepository>(DownloadsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(DownloadsOrquestrator.prototype.pullDownloads.name, () => {
    it('should do not look for downloads in database when the quota left for queue is 0', async () => {
      service.queueActiveDownloadsQuotaLeft = jest
        .fn()
        .mockResolvedValueOnce(0);
      await service.pullDownloads();
      expect(repository.findNextDownload).not.toHaveBeenCalled();
    });

    it('should do not add any download to the queue when repository.findNextDownload returns null', async () => {
      service.queueActiveDownloadsQuotaLeft = jest
        .fn()
        .mockResolvedValueOnce(10);
      repository.findNextDownload = jest.fn().mockResolvedValueOnce({});
      await service.pullDownloads();
      expect(mockedQueue.add).not.toHaveBeenCalled();
    });
  });
});

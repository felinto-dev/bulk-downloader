import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { HosterQuotasService } from '@/services/hoster-quotas.service';
import { HostersService } from '@/services/hosters.service';
import { createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { DownloadsOrquestrator } from '../downloads.orchestrator';

describe(DownloadsOrquestrator.name, () => {
  let service: DownloadsOrquestrator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadsOrquestrator,
        {
          provide: getQueueToken(DOWNLOADS_PROCESSING_QUEUE),
          useValue: createMock<Queue<DownloadJobDto>>(),
        },
        {
          provide: DownloadsRepository,
          useValue: createMock<DownloadsRepository>(),
        },
        {
          provide: HostersService,
          useValue: createMock<HostersService>(),
        },
        {
          provide: HosterQuotasService,
          useValue: createMock<HosterQuotasService>(),
        },
      ],
    }).compile();

    service = module.get<DownloadsOrquestrator>(DownloadsOrquestrator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

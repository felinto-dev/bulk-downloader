import { DOWNLOADS_REQUESTS_QUEUE } from '@/consts/queues';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { DownloadsRequestsService } from '../downloads-requests.service';

describe(DownloadsRequestsService.name, () => {
  let service: DownloadsRequestsService;
  let repository: DownloadsRepository;
  let queue: Queue<AddDownloadRequestInput>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadsRequestsService,
        {
          provide: getQueueToken(DOWNLOADS_REQUESTS_QUEUE),
          useValue: createMock<Queue<AddDownloadRequestInput>>(),
        },
        {
          provide: DownloadsRepository,
          useValue: createMock<DownloadsRepository>(),
        },
      ],
    }).compile();

    service = module.get<DownloadsRequestsService>(DownloadsRequestsService);
    repository = module.get<DownloadsRepository>(DownloadsRepository);
    queue = module.get<Queue<AddDownloadRequestInput>>(
      getQueueToken(DOWNLOADS_REQUESTS_QUEUE),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const mockedDownloadRequest: AddDownloadRequestInput = {
    hosterId: '123',
    downloadId: '123',
    url: 'https://example.com',
    fingerprint: '123',
    priority: 1,
  };

  it('should upsert download request', async () => {
    const voidFunction = await service.upsertDownloadRequest(
      mockedDownloadRequest,
    );

    expect(repository.upsertDownloadRequest).toHaveBeenCalled();
    expect(voidFunction).toBeUndefined();
  });

  it('should upsert bulk download request', async () => {
    const bulkDownloadRequests = [mockedDownloadRequest];

    const voidFunction = await service.upsertBulkDownloadRequest(
      bulkDownloadRequests,
    );

    expect(queue.addBulk).toHaveBeenCalled();
    expect(voidFunction).toBeUndefined();
  });
});

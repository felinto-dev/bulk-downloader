import { DOWNLOADS_SORTING_QUEUE } from '@/consts/queues';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';
import { createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { DownloadsService } from '../downloads.service';

describe(DownloadsService.name, () => {
  let service: DownloadsService;
  let queue: Queue<AddDownloadRequestInput>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadsService,
        {
          provide: getQueueToken(DOWNLOADS_SORTING_QUEUE),
          useValue: createMock<Queue<AddDownloadRequestInput>>(),
        },
      ],
    }).compile();

    service = module.get<DownloadsService>(DownloadsService);
    queue = module.get<Queue<AddDownloadRequestInput>>(
      getQueueToken(DOWNLOADS_SORTING_QUEUE),
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

    expect(queue.add).toHaveBeenCalled();
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

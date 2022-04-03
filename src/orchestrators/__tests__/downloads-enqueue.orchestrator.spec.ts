import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { PendingDownloadsIterator } from '@/iterators/pending-download.interator';
import { createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { DownloadsEnqueueOrchestrator } from '../downloads-enqueue.orchestrator';

describe(DownloadsEnqueueOrchestrator.name, () => {
  let service: DownloadsEnqueueOrchestrator;
  let queue: Queue<DownloadJobDto>;

  const mockedQueue = createMock<Queue<DownloadJobDto>>();
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
      await service.run();
      expect(queue.add).toHaveBeenCalled();
    });
  });
});

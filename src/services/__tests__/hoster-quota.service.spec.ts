import { HosterLimits } from '@/dto/hoster-limits.dto';
import { HostersLimitsRepository } from '@/repositories/hosters-limit.repository';
import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { HosterQuotasService } from '../hoster-quotas.service';

describe(HosterQuotasService.name, () => {
  let service: HosterQuotasService;

  const mockedHosterLimitsRepository = createMock<HostersLimitsRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HosterQuotasService,
        {
          provide: HostersLimitsRepository,
          useValue: mockedHosterLimitsRepository,
        },
      ],
    }).compile();

    service = module.get<HosterQuotasService>(HosterQuotasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const hosterLimits: HosterLimits = {
    monthly: 100,
    daily: 100,
    hourly: 100,
  };
  const downloadsAttempts: HosterLimits = {
    monthly: 10,
    daily: 20,
    hourly: 30,
  };
  const expectedOutcome: HosterLimits = {
    monthly: 90,
    daily: 80,
    hourly: 70,
  };

  describe(HosterQuotasService.prototype.countHosterQuotaLeft.name, () => {
    it('should get the min value from differents periods', async () => {
      mockedHosterLimitsRepository.getQuotasByHosterId.mockResolvedValueOnce(
        hosterLimits,
      );
      mockedHosterLimitsRepository.countUsedDownloadsQuota.mockResolvedValueOnce(
        downloadsAttempts,
      );

      const result = await service.countHosterQuotaLeft('123');

      expect(result).toEqual(70);
    });
  });

  describe(HosterQuotasService.prototype.listHosterQuotasLeft.name, () => {
    it('should get hoster limits and downloads attempts and substract objects to get quota left', async () => {
      mockedHosterLimitsRepository.getQuotasByHosterId.mockResolvedValueOnce(
        hosterLimits,
      );
      mockedHosterLimitsRepository.countUsedDownloadsQuota.mockResolvedValueOnce(
        downloadsAttempts,
      );

      const outcome = await service.listHosterQuotasLeft('123');

      expect(outcome).toEqual(expectedOutcome);
    });

    it('should return null when hoster there is no hoster limits defined', async () => {
      mockedHosterLimitsRepository.getQuotasByHosterId.mockResolvedValueOnce(
        null,
      );

      mockedHosterLimitsRepository.countUsedDownloadsQuota.mockResolvedValueOnce(
        downloadsAttempts,
      );

      const outcome = await service.listHosterQuotasLeft('123');

      expect(outcome).toBeNull();
    });
  });
});

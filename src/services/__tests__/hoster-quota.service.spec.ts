import { HosterQuotas } from '@/dto/hoster-quotas.dto';
import { HosterQuotaRepository } from '@/repositories/hoster-quota.repository';
import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { HosterQuotasService } from '../hoster-quotas.service';

describe(HosterQuotasService.name, () => {
  let service: HosterQuotasService;

  const mockedHosterLimitsRepository = createMock<HosterQuotaRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HosterQuotasService,
        {
          provide: HosterQuotaRepository,
          useValue: mockedHosterLimitsRepository,
        },
      ],
    }).compile();

    service = module.get<HosterQuotasService>(HosterQuotasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const hosterLimits: HosterQuotas = {
    monthlyDownloadLimit: 100,
    dailyDownloadLimit: 100,
    hourlyDownloadLimit: 100,
  };
  const downloadsAttempts: HosterQuotas = {
    monthlyDownloadLimit: 10,
    dailyDownloadLimit: 20,
    hourlyDownloadLimit: 30,
  };
  const expectedOutcome: HosterQuotas = {
    monthlyDownloadLimit: 90,
    dailyDownloadLimit: 80,
    hourlyDownloadLimit: 70,
  };

  describe(HosterQuotasService.prototype.getQuotaLeft.name, () => {
    it('should get the min value from differents periods', async () => {
      mockedHosterLimitsRepository.getQuotasByHosterId.mockResolvedValueOnce(
        hosterLimits,
      );
      mockedHosterLimitsRepository.countUsedDownloadsQuota.mockResolvedValueOnce(
        downloadsAttempts,
      );

      const result = await service.getQuotaLeft('123');

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

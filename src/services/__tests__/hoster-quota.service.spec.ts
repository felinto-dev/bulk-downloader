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

  const hosterQuotas: HosterQuotas = {
    monthlyDownloadLimit: 100,
    dailyDownloadLimit: 100,
    hourlyDownloadLimit: 100,
  };
  const hosterQuotasUsed: HosterQuotas = {
    monthlyDownloadLimit: 10,
    dailyDownloadLimit: 20,
    hourlyDownloadLimit: 30,
  };

  describe(HosterQuotasService.prototype.getHosterQuotaLeft.name, () => {
    // suggest a better test name
    it('should return the quota left for a hoster considering the quota for each period e.g. (monthly, daily, hourly) and get the min value as the quota left for the hoster', async () => {
      mockedHosterLimitsRepository.getQuotasByHosterId.mockResolvedValueOnce(
        hosterQuotas,
      );
      mockedHosterLimitsRepository.countUsedDownloadsQuota.mockResolvedValueOnce(
        hosterQuotasUsed,
      );

      const result = await service.getHosterQuotaLeft('123');

      expect(result).toEqual(70);
    });

    it('should return -1 to means "unlimited" quota', async () => {
      mockedHosterLimitsRepository.getQuotasByHosterId.mockResolvedValueOnce(
        {},
      );
      mockedHosterLimitsRepository.countUsedDownloadsQuota.mockResolvedValueOnce(
        hosterQuotasUsed,
      );

      const result = await service.getHosterQuotaLeft('123');

      expect(result).toEqual(-1);
    });
  });

  describe(HosterQuotasService.prototype.listHosterQuotasLeft.name, () => {
    it('should subtract the used quota from the total quota', async () => {
      mockedHosterLimitsRepository.getQuotasByHosterId.mockResolvedValueOnce({
        monthlyDownloadLimit: 100,
        dailyDownloadLimit: 100,
        hourlyDownloadLimit: 100,
      });
      mockedHosterLimitsRepository.countUsedDownloadsQuota.mockResolvedValueOnce(
        {
          monthlyDownloadLimit: 10,
          dailyDownloadLimit: 20,
          hourlyDownloadLimit: 30,
        },
      );

      const outcome = await service.listHosterQuotasLeft('123');

      expect(outcome).toEqual({
        monthlyDownloadLimit: 90,
        dailyDownloadLimit: 80,
        hourlyDownloadLimit: 70,
      });
    });

    it('should return an empty object if the hoster has no quota', async () => {
      mockedHosterLimitsRepository.getQuotasByHosterId.mockResolvedValueOnce(
        {},
      );

      mockedHosterLimitsRepository.countUsedDownloadsQuota.mockResolvedValueOnce(
        {
          monthlyDownloadLimit: 10,
          dailyDownloadLimit: 20,
          hourlyDownloadLimit: 30,
        },
      );

      const outcome = await service.listHosterQuotasLeft('123');

      expect(outcome).toStrictEqual({});
    });

    it('should return 0 as quota left when the hoster quota - used quota is a negative number', async () => {
      mockedHosterLimitsRepository.getQuotasByHosterId.mockResolvedValueOnce({
        monthlyDownloadLimit: 100,
        dailyDownloadLimit: 100,
        hourlyDownloadLimit: 100,
      });
      mockedHosterLimitsRepository.countUsedDownloadsQuota.mockResolvedValueOnce(
        {
          monthlyDownloadLimit: 1000,
          dailyDownloadLimit: 100,
          hourlyDownloadLimit: 100,
        },
      );

      const outcome = await service.listHosterQuotasLeft('123');

      expect(outcome).toStrictEqual({
        monthlyDownloadLimit: 0,
        dailyDownloadLimit: 0,
        hourlyDownloadLimit: 0,
      });
    });

    it('should not substract the used quota from the total quota if the hoster has no quota for a specific period', async () => {
      mockedHosterLimitsRepository.getQuotasByHosterId.mockResolvedValueOnce({
        monthlyDownloadLimit: 100,
        dailyDownloadLimit: 100,
        hourlyDownloadLimit: 100,
      });
      mockedHosterLimitsRepository.countUsedDownloadsQuota.mockResolvedValueOnce(
        {
          dailyDownloadLimit: 100,
          hourlyDownloadLimit: 100,
        },
      );

      const outcome = await service.listHosterQuotasLeft('123');

      expect(outcome).toStrictEqual({
        monthlyDownloadLimit: 100,
        dailyDownloadLimit: 0,
        hourlyDownloadLimit: 0,
      });
    });
  });
});

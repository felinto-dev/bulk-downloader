import { HosterLimits } from '@/dto/hoster-limits.dto';
import { HostersLimitsRepository } from '@/repositories/hosters-limit.repository';
import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { HosterQuotaService } from '../hoster-quota.service';

describe(HosterQuotaService.name, () => {
  let service: HosterQuotaService;

  const mockedHosterLimitsRepository = createMock<HostersLimitsRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HosterQuotaService,
        {
          provide: HostersLimitsRepository,
          useValue: mockedHosterLimitsRepository,
        },
      ],
    }).compile();

    service = module.get<HosterQuotaService>(HosterQuotaService);
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

  describe(HosterQuotaService.prototype.countHosterQuotaLeft.name, () => {
    it('should get the min value from differents periods', async () => {
      mockedHosterLimitsRepository.getHosterLimits.mockResolvedValueOnce(
        hosterLimits,
      );
      mockedHosterLimitsRepository.countHosterDownloadsAttempts.mockResolvedValueOnce(
        downloadsAttempts,
      );

      const result = await service.countHosterQuotaLeft('123');

      expect(result).toEqual(70);
    });
  });

  describe(HosterQuotaService.prototype.listHosterQuotas.name, () => {
    it('should get hoster limits and downloads attempts and substract objects to get quota left', async () => {
      mockedHosterLimitsRepository.getHosterLimits.mockResolvedValueOnce(
        hosterLimits,
      );
      mockedHosterLimitsRepository.countHosterDownloadsAttempts.mockResolvedValueOnce(
        downloadsAttempts,
      );

      const outcome = await service.listHosterQuotas('123');

      expect(outcome).toEqual(expectedOutcome);
    });

    it('should return null when hoster there is no hoster limits defined', async () => {
      mockedHosterLimitsRepository.getHosterLimits.mockResolvedValueOnce(null);

      mockedHosterLimitsRepository.countHosterDownloadsAttempts.mockResolvedValueOnce(
        downloadsAttempts,
      );

      const outcome = await service.listHosterQuotas('123');

      expect(outcome).toBeNull();
    });
  });
});

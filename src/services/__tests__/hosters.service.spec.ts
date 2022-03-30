import { HostersRepository } from '@/repositories/hosters.repository';
import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { HostersService } from '../hosters.service';

describe(HostersService.name, () => {
  let service: HostersService;

  const mockedHostersRepository = createMock<HostersRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HostersService,
        {
          provide: HostersRepository,
          useValue: mockedHostersRepository,
        },
      ],
    }).compile();

    service = module.get<HostersService>(HostersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

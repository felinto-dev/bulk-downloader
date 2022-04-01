import { UpsertHosterInput } from '@/inputs/upsert-hoster.input';
import { HostersRepository } from '@/repositories/hosters.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HostersService {
  constructor(private readonly hostersRepository: HostersRepository) {}

  async upsertHoster(hoster: UpsertHosterInput) {
    return this.hostersRepository.upsertHoster(hoster);
  }
}

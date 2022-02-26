import { Injectable } from '@nestjs/common';

import { HostersRepository } from '@/repositories/hosters.repository';

@Injectable()
export class HostersService {
  constructor(private readonly hostersRepository: HostersRepository) {}

  async findHosterReadyToPull() {
    const hoster = await this.hostersRepository.findHosterReadyToPull();

    if (!hoster) {
      // increase releaseAt
      // return itself
    }

    // return Promise.all(
    //   hosters.map(async (hoster) => ({
    //     id: hoster.id,
    //     quotaLeft: await this.countHosterQuotaLeft(hoster.id),
    //   })),
    // );
    return [];
  }
}

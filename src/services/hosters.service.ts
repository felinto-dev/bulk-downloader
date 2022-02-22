import { Injectable } from '@nestjs/common';

import { HostersRepository } from '@/repositories/hosters.repository';

@Injectable()
export class HostersService {
  constructor(private readonly hostersRepository: HostersRepository) {}

  async getInactiveHosters() {
    const hosters = await this.hostersRepository.getInactiveHosters();

    return hosters
      .map((hoster) => {
        if (hoster.concurrency === 0) {
          return;
        }

        return hoster;
      })
      .filter((hoster) => !!hoster);
  }
}

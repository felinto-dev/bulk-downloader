import { Injectable, OnModuleInit } from '@nestjs/common';

import { HostersRepository } from '@/repositories/hosters.repository';

@Injectable()
export class HostersService implements OnModuleInit {
  constructor(private readonly hostersRepository: HostersRepository) {}

  async onModuleInit() {
    await this.getInactiveHosters();
  }

  async getInactiveHosters() {
    const hosters = await this.hostersRepository.getInactiveHosters();

    return hosters
      .map((hoster) => {
        // console.log(Object.values(hoster.limits).filter((limit) => !!limit));
        if (hoster.concurrency === 0) {
          return;
        }

        return hoster;
      })
      .filter((hoster) => !!hoster);
  }
}

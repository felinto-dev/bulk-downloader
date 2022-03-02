import { Body, Controller, Post } from '@nestjs/common';

import { CreateHosterInput } from '@/inputs/create-hoster.input';
import { HostersService } from '@/services/hosters.service';

@Controller('hosters')
export class HostersController {
  constructor(private readonly hostersService: HostersService) {}

  @Post()
  async createHoster(@Body() hoster: CreateHosterInput) {
    return this.hostersService.upsertHoster(hoster);
  }
}

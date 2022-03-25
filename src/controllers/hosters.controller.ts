import { UpsertHosterInput } from '@/inputs/upsert-hoster.input';
import { HostersService } from '@/services/hosters.service';
import { Body, Controller, Put } from '@nestjs/common';

@Controller('hosters')
export class HostersController {
  constructor(private readonly hostersService: HostersService) {}

  @Put()
  async upsertHoster(@Body() hoster: UpsertHosterInput) {
    return this.hostersService.upsertHoster(hoster);
  }
}

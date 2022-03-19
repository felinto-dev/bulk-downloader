import { CreateHosterInput } from '@/inputs/create-hoster.input';
import { HostersService } from '@/services/hosters.service';
import { Body, Controller, Put } from '@nestjs/common';

@Controller('hosters')
export class HostersController {
  constructor(private readonly hostersService: HostersService) {}

  @Put()
  async upsertHoster(@Body() hoster: CreateHosterInput) {
    return this.hostersService.upsertHoster(hoster);
  }
}

import { parseMap, serializeMap } from '@/utils/map';
import { sumMapValues } from '@/utils/objects';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class DownloadsInProgressRepository implements OnModuleInit {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async onModuleInit() {
    await this.cacheManager.set(this.key, this.serialize(new Map()));
  }

  private readonly key = 'downloads_in_progress_by_hoster';

  private parse(map: string): Map<string, number> {
    return parseMap(map);
  }

  private serialize(map: Map<string, number>) {
    return serializeMap(map);
  }

  async sum() {
    const map = this.parse(await this.cacheManager.get<string>(this.key));
    return sumMapValues(map);
  }

  async get(hosterId?: string, defaultValue = 0): Promise<number> {
    const map = this.parse(await this.cacheManager.get<string>(this.key));
    return map.get(hosterId) || defaultValue;
  }

  async set(hosterId: string, value: number) {
    const map = this.parse(await this.cacheManager.get<string>(this.key));
    map.set(hosterId, value);
    await this.cacheManager.set(this.key, this.serialize(map));
  }
}

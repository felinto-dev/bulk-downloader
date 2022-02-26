import { SimpleObject } from '@/utils/objects';

export interface HosterLimits extends SimpleObject {
  monthly: number;
  daily: number;
  hourly: number;
}

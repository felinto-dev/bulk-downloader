import { HostersRepository } from '@/repositories/hosters.repository';
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'HosterExists', async: true })
export class HosterExistsRule implements ValidatorConstraintInterface {
  constructor(private hostersRepository: HostersRepository) {}

  async validate(hosterId: string) {
    try {
      await this.hostersRepository.getHosterById(hosterId);
    } catch (e) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return `Hoster doesn't exist`;
  }
}

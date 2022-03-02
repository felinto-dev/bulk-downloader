import { HosterAuthenticationMethod, HosterLimits } from '@prisma/client';

export class CreateHosterInput {
  id: string;

  name: string;

  concurrencyConnections: number;

  limits: HosterLimits;

  credentialsStrategy: HosterAuthenticationMethod;
}

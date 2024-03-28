import { z } from 'zod';

import { BillingProvider, BillingStrategyProviderService } from '@kit/billing';

export class BillingGatewayFactoryService {
  static async GetProviderStrategy(
    provider: z.infer<typeof BillingProvider>,
  ): Promise<BillingStrategyProviderService> {
    switch (provider) {
      case 'stripe': {
        const { StripeBillingStrategyService } = await import('@kit/stripe');

        return new StripeBillingStrategyService();
      }

      case 'paddle': {
        throw new Error('Paddle is not supported yet');
      }

      case 'lemon-squeezy': {
        throw new Error('Lemon Squeezy is not supported yet');
      }

      default:
        throw new Error(`Unsupported billing provider: ${provider as string}`);
    }
  }
}

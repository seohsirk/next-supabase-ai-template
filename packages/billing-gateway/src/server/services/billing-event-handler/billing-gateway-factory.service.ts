import { z } from 'zod';

import { BillingProvider, BillingWebhookHandlerService } from '@kit/billing';

export class BillingEventHandlerFactoryService {
  static async GetProviderStrategy(
    provider: z.infer<typeof BillingProvider>,
  ): Promise<BillingWebhookHandlerService> {
    switch (provider) {
      case 'stripe': {
        const { StripeWebhookHandlerService } = await import('@kit/stripe');

        return new StripeWebhookHandlerService();
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

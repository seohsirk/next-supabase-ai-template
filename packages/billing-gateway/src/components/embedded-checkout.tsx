import { lazy } from 'react';

import { Database } from '@kit/supabase/database';

type BillingProvider = Database['public']['Enums']['billing_provider'];

export function EmbeddedCheckout(
  props: React.PropsWithChildren<{
    checkoutToken: string;
    provider: BillingProvider;
    onClose?: () => void;
  }>,
) {
  const CheckoutComponent = loadCheckoutComponent(props.provider);

  return (
    <CheckoutComponent
      onClose={props.onClose}
      checkoutToken={props.checkoutToken}
    />
  );
}

function loadCheckoutComponent(provider: BillingProvider) {
  switch (provider) {
    case 'stripe': {
      return lazy(() => {
        return import('@kit/stripe/components').then((c) => ({
          default: c.StripeCheckout,
        }));
      });
    }

    case 'lemon-squeezy': {
      throw new Error('Lemon Squeezy is not yet supported');
    }

    case 'paddle': {
      throw new Error('Paddle is not yet supported');
    }

    default:
      throw new Error(`Unsupported provider: ${provider as string}`);
  }
}

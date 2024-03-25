'use client';

import Link from 'next/link';

import { CheckIcon, ChevronRightIcon } from 'lucide-react';
import type { Stripe } from 'stripe';

import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';

/**
 * Retrieves the session status for a Stripe checkout session.
 * Since we should only arrive here for a successful checkout, we only check
 * for the `paid` status.
 *
 * @param {Stripe.Checkout.Session['status']} status - The status of the Stripe checkout session.
 * @param {string} customerEmail - The email address of the customer associated with the session.
 *
 * @returns {ReactElement} - The component to render based on the session status.
 */
export function BillingSessionStatus({
  customerEmail,
}: React.PropsWithChildren<{
  status: Stripe.Checkout.Session['status'];
  customerEmail: string;
}>) {
  return <SuccessSessionStatus customerEmail={customerEmail} />;
}

function SuccessSessionStatus({
  customerEmail,
}: React.PropsWithChildren<{
  customerEmail: string;
}>) {
  return (
    <section
      data-test={'payment-return-success'}
      className={
        'mx-auto max-w-xl rounded-xl border p-16 fade-in xl:drop-shadow-sm' +
        ' dark:border-dark-800 border-gray-100' +
        ' bg-background ease-out animate-in slide-in-from-bottom-8' +
        ' duration-1000 zoom-in-50 dark:shadow-2xl dark:shadow-primary/40'
      }
    >
      <div
        className={
          'flex flex-col items-center justify-center space-y-4 text-center'
        }
      >
        <CheckIcon
          className={
            'w-16 rounded-full bg-green-500 p-1 text-white ring-8' +
            ' ring-green-500/30 dark:ring-green-500/50'
          }
        />

        <Heading level={3}>
          <span className={'mr-4 font-semibold'}>
            <Trans i18nKey={'subscription:checkoutSuccessTitle'} />
          </span>
          🎉
        </Heading>

        <div
          className={'flex flex-col space-y-4 text-gray-500 dark:text-gray-400'}
        >
          <p>
            <Trans
              i18nKey={'subscription:checkoutSuccessDescription'}
              values={{ customerEmail }}
            />
          </p>
        </div>

        <Button data-test={'checkout-success-back-button'} variant={'outline'}>
          <Link href={pathsConfig.app.home}>
            <span className={'flex items-center space-x-2.5'}>
              <span>
                <Trans i18nKey={'subscription:checkoutSuccessBackButton'} />
              </span>

              <ChevronRightIcon className={'h-4'} />
            </span>
          </Link>
        </Button>
      </div>
    </section>
  );
}

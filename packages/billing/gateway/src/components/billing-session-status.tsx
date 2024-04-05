'use client';

import Link from 'next/link';

import { Check, ChevronRight } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

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
  redirectPath,
}: React.PropsWithChildren<{
  customerEmail: string;
  redirectPath: string;
}>) {
  return (
    <SuccessSessionStatus
      redirectPath={redirectPath}
      customerEmail={customerEmail}
    />
  );
}

function SuccessSessionStatus({
  customerEmail,
  redirectPath,
}: React.PropsWithChildren<{
  customerEmail: string;
  redirectPath: string;
}>) {
  return (
    <section
      data-test={'payment-return-success'}
      className={
        'fade-in mx-auto max-w-xl rounded-xl border p-16 xl:drop-shadow-sm' +
        ' dark:border-dark-800 border-gray-100' +
        ' bg-background animate-in slide-in-from-bottom-8 ease-out' +
        ' zoom-in-50 dark:shadow-primary/40 duration-1000 dark:shadow-2xl'
      }
    >
      <div
        className={
          'flex flex-col items-center justify-center space-y-4 text-center'
        }
      >
        <Check
          className={
            'h-16 w-16 rounded-full bg-green-500 p-1 text-white ring-8' +
            ' ring-green-500/30 dark:ring-green-500/50'
          }
        />

        <Heading level={3}>
          <span className={'mr-4 font-semibold'}>
            <Trans i18nKey={'billing:checkoutSuccessTitle'} />
          </span>
          🎉
        </Heading>

        <div className={'text-muted-foreground flex flex-col space-y-4'}>
          <p>
            <Trans
              i18nKey={'billing:checkoutSuccessDescription'}
              values={{ customerEmail }}
            />
          </p>
        </div>

        <Button data-test={'checkout-success-back-button'} variant={'outline'}>
          <Link href={redirectPath}>
            <span className={'flex items-center space-x-2.5'}>
              <span>
                <Trans i18nKey={'billing:checkoutSuccessBackButton'} />
              </span>

              <ChevronRight className={'h-4'} />
            </span>
          </Link>
        </Button>
      </div>
    </section>
  );
}

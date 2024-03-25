import { notFound, redirect } from 'next/navigation';

import requireSession from '@/lib/user/require-session';

import { withI18n } from '@packages/i18n/with-i18n';
import getSupabaseServerComponentClient from '@packages/supabase/server-component-client';

import createStripeClient from '@kit/stripe/get-stripe';

import { BillingSessionStatus } from './components/billing-session-status';
import RecoverCheckout from './components/recover-checkout';

interface SessionPageProps {
  searchParams: {
    session_id: string;
  };
}

async function ReturnStripeSessionPage({ searchParams }: SessionPageProps) {
  const { status, customerEmail, clientSecret } = await loadStripeSession(
    searchParams.session_id,
  );

  if (clientSecret) {
    return <RecoverCheckout clientSecret={clientSecret} />;
  }

  return (
    <>
      <div className={'fixed left-0 top-48 z-50 mx-auto w-full'}>
        <BillingSessionStatus
          status={status}
          customerEmail={customerEmail ?? ''}
        />
      </div>

      <div
        className={
          'fixed left-0 top-0 w-full bg-background/30 backdrop-blur-sm' +
          ' !m-0 h-full'
        }
      />
    </>
  );
}

export default withI18n(ReturnStripeSessionPage);

export async function loadStripeSession(sessionId: string) {
  await requireSession(getSupabaseServerComponentClient());

  // now we fetch the session from Stripe
  // and check if it's still open
  const stripe = await createStripeClient();

  const session = await stripe.checkout.sessions
    .retrieve(sessionId)
    .catch(() => undefined);

  if (!session) {
    notFound();
  }

  const isSessionOpen = session.status === 'open';
  const clientSecret = isSessionOpen ? session.client_secret : null;
  const isEmbeddedMode = session.ui_mode === 'embedded';

  // if the session is still open, we redirect the user to the checkout page
  // in Stripe self hosted mode
  if (isSessionOpen && !isEmbeddedMode && session.url) {
    redirect(session.url);
  }

  // otherwise - we show the user the return page
  // and display the details of the session
  return {
    status: session.status,
    customerEmail: session.customer_details?.email,
    clientSecret,
  };
}

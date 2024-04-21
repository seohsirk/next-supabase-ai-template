import { redirect } from 'next/navigation';

import {
  BillingPortalCard,
  CurrentLifetimeOrderCard,
  CurrentSubscriptionCard,
} from '@kit/billing-gateway/components';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { If } from '@kit/ui/if';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import billingConfig from '~/config/billing.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { UserAccountHeader } from '../_components/user-account-header';
import { createPersonalAccountBillingPortalSession } from '../billing/server-actions';
import { PersonalAccountCheckoutForm } from './_components/personal-account-checkout-form';
// user billing imports
import { loadPersonalAccountBillingPageData } from './_lib/server/personal-account-billing-page.loader';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:billingTab');

  return {
    title,
  };
};

async function PersonalAccountBillingPage() {
  const client = getSupabaseServerComponentClient();
  const auth = await requireUser(client);

  if (auth.error) {
    redirect(auth.redirectTo);
  }

  const [data, customerId] = await loadPersonalAccountBillingPageData(
    auth.data.id,
  );

  return (
    <>
      <UserAccountHeader
        title={<Trans i18nKey={'common:billingTabLabel'} />}
        description={<Trans i18nKey={'common:billingTabDescription'} />}
      />

      <PageBody>
        <div className={'flex flex-col space-y-8'}>
          <If condition={!data}>
            <PersonalAccountCheckoutForm customerId={customerId} />

            <If condition={customerId}>
              <CustomerBillingPortalForm />
            </If>
          </If>

          <If condition={data}>
            {(data) => (
              <div
                className={'mx-auto flex w-full max-w-2xl flex-col space-y-6'}
              >
                {'active' in data ? (
                  <CurrentSubscriptionCard
                    subscription={data}
                    config={billingConfig}
                  />
                ) : (
                  <CurrentLifetimeOrderCard
                    order={data}
                    config={billingConfig}
                  />
                )}

                <If condition={!data}>
                  <PersonalAccountCheckoutForm customerId={customerId} />
                </If>

                <If condition={customerId}>
                  <CustomerBillingPortalForm />
                </If>
              </div>
            )}
          </If>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(PersonalAccountBillingPage);

function CustomerBillingPortalForm() {
  return (
    <form action={createPersonalAccountBillingPortalSession}>
      <BillingPortalCard />
    </form>
  );
}

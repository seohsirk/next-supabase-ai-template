import { SupabaseClient } from '@supabase/supabase-js';

import {
  BillingPortalCard,
  CurrentPlanCard,
} from '@kit/billing-gateway/components';
import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { If } from '@kit/ui/if';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { UserAccountHeader } from '~/(dashboard)/home/(user)/_components/user-account-header';
import { createPersonalAccountBillingPortalSession } from '~/(dashboard)/home/(user)/billing/server-actions';
import billingConfig from '~/config/billing.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { PersonalAccountCheckoutForm } from './_components/personal-account-checkout-form';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:billingTab');

  return {
    title,
  };
};

async function PersonalAccountBillingPage() {
  const client = getSupabaseServerComponentClient();
  const [subscription, customerId] = await loadData(client);

  return (
    <>
      <UserAccountHeader
        title={<Trans i18nKey={'common:billingTabLabel'} />}
        description={<Trans i18nKey={'common:billingTabDescription'} />}
      />

      <PageBody>
        <div className={'flex flex-col space-y-8'}>
          <If condition={!subscription}>
            <PersonalAccountCheckoutForm customerId={customerId} />

            <If condition={customerId}>
              <CustomerBillingPortalForm />
            </If>
          </If>

          <If condition={subscription}>
            {(subscription) => (
              <div
                className={'mx-auto flex w-full max-w-2xl flex-col space-y-4'}
              >
                <CurrentPlanCard
                  subscription={subscription}
                  config={billingConfig}
                />

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

async function loadData(client: SupabaseClient<Database>) {
  const { data, error } = await client.auth.getUser();

  if (error ?? !data?.user) {
    throw new Error('Authentication required');
  }

  const user = data.user;

  const subscription = client
    .from('subscriptions')
    .select('*, items: subscription_items !inner (*)')
    .eq('account_id', user.id)
    .maybeSingle()
    .then(({ data }) => data);

  const customer = client
    .from('billing_customers')
    .select('customer_id')
    .eq('account_id', user.id)
    .maybeSingle()
    .then(({ data }) => data?.customer_id);

  return Promise.all([subscription, customer]);
}

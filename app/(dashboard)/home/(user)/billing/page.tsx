import { redirect } from 'next/navigation';

import { SupabaseClient } from '@supabase/supabase-js';

import {
  BillingPortalCard,
  CurrentPlanCard,
} from '@kit/billing-gateway/components';
import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { If } from '@kit/ui/if';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createPersonalAccountBillingPortalSession } from '~/(dashboard)/home/(user)/billing/server-actions';
import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';

import { loadUserWorkspace } from '../../_lib/load-user-workspace';
import { PersonalAccountCheckoutForm } from './_components/personal-account-checkout-form';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

async function PersonalAccountBillingPage() {
  const client = getSupabaseServerComponentClient();
  const { session } = await loadUserWorkspace();

  if (!session?.user) {
    redirect(pathsConfig.auth.signIn);
  }

  const [subscription, customerId] = await loadData(client, session.user.id);

  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'common:billingTabLabel'} />}
        description={<Trans i18nKey={'common:billingTabDescription'} />}
      />

      <PageBody>
        <div className={'mx-auto w-full max-w-2xl'}>
          <div className={'flex flex-col space-y-8'}>
            <If
              condition={subscription}
              fallback={<PersonalAccountCheckoutForm />}
            >
              {(subscription) => (
                <CurrentPlanCard
                  subscription={subscription}
                  config={billingConfig}
                />
              )}
            </If>

            <If condition={customerId}>
              <form action={createPersonalAccountBillingPortalSession}>
                <BillingPortalCard />
              </form>
            </If>
          </div>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(PersonalAccountBillingPage);

function loadData(client: SupabaseClient<Database>, userId: string) {
  const subscription = client
    .from('subscriptions')
    .select<string, Subscription>('*')
    .eq('account_id', userId)
    .maybeSingle()
    .then(({ data }) => data);

  const customer = client
    .from('billing_customers')
    .select('customer_id')
    .eq('account_id', userId)
    .maybeSingle()
    .then(({ data }) => data?.customer_id);

  return Promise.all([subscription, customer]);
}

import {
  BillingPortalCard,
  CurrentPlanCard,
} from '@kit/billing-gateway/components';
import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { If } from '@kit/ui/if';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { loadOrganizationWorkspace } from '~/(dashboard)/home/[account]/_lib/load-workspace';
import { createBillingPortalSession } from '~/(dashboard)/home/[account]/billing/server-actions';
import billingConfig from '~/config/billing.config';
import { withI18n } from '~/lib/i18n/with-i18n';

import { TeamAccountCheckoutForm } from './_components/team-account-checkout-form';

interface Params {
  params: {
    account: string;
  };
}

async function OrganizationAccountBillingPage({ params }: Params) {
  const workspace = await loadOrganizationWorkspace(params.account);
  const accountId = workspace.account.id;
  const [subscription, customerId] = await loadAccountData(accountId);

  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'common:billingTabLabel'} />}
        description={<Trans i18nKey={'common:billingTabDescription'} />}
      />

      <PageBody>
        <div className={'mx-auto w-full max-w-2xl'}>
          <div className={'flex flex-col space-y-4'}>
            <If
              condition={subscription}
              fallback={<TeamAccountCheckoutForm accountId={accountId} />}
            >
              {(data) => (
                <CurrentPlanCard subscription={data} config={billingConfig} />
              )}
            </If>

            <If condition={customerId}>
              <form action={createBillingPortalSession}>
                <input type="hidden" name={'accountId'} value={accountId} />
                <input type="hidden" name={'slug'} value={params.account} />

                <BillingPortalCard />
              </form>
            </If>
          </div>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(OrganizationAccountBillingPage);

async function loadAccountData(accountId: string) {
  const client = getSupabaseServerComponentClient();

  const subscription = client
    .from('subscriptions')
    .select<string, Database['public']['Tables']['subscriptions']['Row']>('*')
    .eq('account_id', accountId)
    .maybeSingle()
    .then(({ data }) => data);

  const customerId = client
    .from('billing_customers')
    .select('customer_id')
    .eq('account_id', accountId)
    .maybeSingle();

  return Promise.all([subscription, customerId]);
}

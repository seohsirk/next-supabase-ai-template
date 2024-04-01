import {
  BillingPortalCard,
  CurrentPlanCard,
} from '@kit/billing-gateway/components';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { If } from '@kit/ui/if';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { loadTeamWorkspace } from '~/(dashboard)/home/[account]/_lib/load-team-account-workspace';
import { createBillingPortalSession } from '~/(dashboard)/home/[account]/billing/server-actions';
import billingConfig from '~/config/billing.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { TeamAccountCheckoutForm } from './_components/team-account-checkout-form';

interface Params {
  params: {
    account: string;
  };
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('teams:billing.pageTitle');

  return {
    title,
  };
};

async function TeamAccountBillingPage({ params }: Params) {
  const workspace = await loadTeamWorkspace(params.account);
  const accountId = workspace.account.id;
  const [subscription, customerId] = await loadAccountData(accountId);

  const canManageBilling =
    workspace.account.permissions.includes('billing.manage');

  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'common:billingTabLabel'} />}
        description={<Trans i18nKey={'common:billingTabDescription'} />}
      />

      <PageBody>
        <div className={'mx-auto w-full'}>
          <If condition={!canManageBilling}>
            <CannotManageBillingAlert />
          </If>

          <div>
            <div className={'flex flex-col space-y-2'}>
              <If
                condition={subscription}
                fallback={
                  <If condition={canManageBilling}>
                    <TeamAccountCheckoutForm
                      customerId={customerId}
                      accountId={accountId}
                    />
                  </If>
                }
              >
                {(data) => (
                  <CurrentPlanCard subscription={data} config={billingConfig} />
                )}
              </If>

              <If condition={customerId && canManageBilling}>
                <form action={createBillingPortalSession}>
                  <input type="hidden" name={'accountId'} value={accountId} />
                  <input type="hidden" name={'slug'} value={params.account} />

                  <BillingPortalCard />
                </form>
              </If>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(TeamAccountBillingPage);

function CannotManageBillingAlert() {
  return (
    <Alert>
      <AlertTitle>
        <Trans i18nKey={'billing:cannotManageBillingAlertTitle'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'billing:cannotManageBillingAlertDescription'} />
      </AlertDescription>
    </Alert>
  );
}

async function loadAccountData(accountId: string) {
  const client = getSupabaseServerComponentClient();

  const subscription = client
    .from('subscriptions')
    .select('*, items: subscription_items !inner (*)')
    .eq('account_id', accountId)
    .maybeSingle()
    .then(({ data }) => data);

  const customerId = client
    .from('billing_customers')
    .select('customer_id')
    .eq('account_id', accountId)
    .maybeSingle()
    .then(({ data }) => data?.customer_id);

  return Promise.all([subscription, customerId]);
}

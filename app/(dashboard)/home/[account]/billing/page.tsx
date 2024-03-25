import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { If } from '@kit/ui/if';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { loadOrganizationWorkspace } from '~/(dashboard)/home/[account]/_lib/load-workspace';
import { BillingPortalForm } from '~/(dashboard)/home/[account]/billing/_components/billing-portal-form';
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
  const customerId = await loadCustomerIdFromAccount(accountId);

  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'common:billingTabLabel'} />}
        description={<Trans i18nKey={'common:billingTabDescription'} />}
      />

      <PageBody>
        <TeamAccountCheckoutForm accountId={accountId} />

        <If condition={customerId}>
          <BillingPortalForm accountId={accountId} />
        </If>
      </PageBody>
    </>
  );
}

export default withI18n(OrganizationAccountBillingPage);

async function loadCustomerIdFromAccount(accountId: string) {
  const client = getSupabaseServerComponentClient();

  const { data, error } = await client
    .from('billing_customers')
    .select('customer_id')
    .eq('account_id', accountId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.customer_id;
}

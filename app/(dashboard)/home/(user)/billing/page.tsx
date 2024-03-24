import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

import { PersonalAccountCheckoutForm } from './components/personal-account-checkout-form';

function PersonalAccountBillingPage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'common:billingTabLabel'} />}
        description={<Trans i18nKey={'common:billingTabDescription'} />}
      />

      <PageBody>
        <PersonalAccountCheckoutForm />
      </PageBody>
    </>
  );
}

export default withI18n(PersonalAccountBillingPage);

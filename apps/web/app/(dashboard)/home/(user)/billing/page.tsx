import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { PersonalAccountCheckoutForm } from '~/(dashboard)/home/(user)/billing/_components/personal-account-checkout-form';
import { withI18n } from '~/lib/i18n/with-i18n';

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

import { withI18n } from '~/lib/i18n/with-i18n';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

function PersonalAccountBillingPage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'common:billingTabLabel'} />}
        description={<Trans i18nKey={'common:billingTabDescription'} />}
      />

      <PageBody></PageBody>
    </>
  );
}

export default withI18n(PersonalAccountBillingPage);
